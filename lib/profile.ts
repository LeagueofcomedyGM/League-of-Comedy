import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export type UserType = 'fan' | 'comedian' | 'organizer';

export interface ProfileResult {
  found: boolean;
  userType?: UserType;
  docId?: string;
}

export interface SignupResult {
  status: 'created' | 'claimed' | 'already_exists';
  userType: UserType;
  docId: string;
}

// All user types have a /users doc — one lookup covers everyone
export async function getUserProfile(uid: string): Promise<ProfileResult> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    return { found: true, userType: snap.data().user_type as UserType, docId: uid };
  }
  return { found: false };
}

export async function handleUserSignup(
  uid: string,
  email: string,
  userType: UserType,
): Promise<SignupResult> {
  const existing = await getUserProfile(uid);
  if (existing.found) {
    return { status: 'already_exists', userType: existing.userType!, docId: existing.docId! };
  }

  switch (userType) {
    case 'comedian':  return createOrClaimComedianProfile(uid, email);
    case 'fan':       return createFanProfile(uid);
    case 'organizer': return createOrganizerProfile(uid);
  }
}

async function createOrClaimComedianProfile(uid: string, email: string): Promise<SignupResult> {
  const claimSnap = await getDocs(
    query(
      collection(db, 'comedians'),
      where('comedian_email', '==', email.toLowerCase()),
      where('claimed', '==', false),
      limit(1),
    )
  );

  if (!claimSnap.empty) {
    const existing = claimSnap.docs[0];
    await updateDoc(existing.ref, {
      uid,
      claimed:    true,
      claimed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    await setDoc(doc(db, 'users', uid), {
      uid,
      user_type:  'comedian',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return { status: 'claimed', userType: 'comedian', docId: existing.id };
  }

  await setDoc(doc(db, 'comedians', uid), {
    uid,
    user_type:          'comedian',
    claimed:            true,
    claimed_at:         serverTimestamp(),
    comedian_name:      '',
    comedian_image:     '',
    comedian_website:   '',
    facebook_link:      '',
    x_link:             '',
    instagram_link:     '',
    tiktok_link:        '',
    youtube_link:       '',
    imdb_link:          '',
    bio:                '',
    comedy_clip_link:   '',
    location:           '',
    slug:               '',
    experience_level:   '',
    comedy_styles:      [],
    comedy_vibes:       [],
    comedy_themes:      [],
    set_lengths:        [],
    rate_range:         '',
    payment_methods:    [],
    languages_spoken:   [],
    share_demographics: false,
    gender_identity:    [],
    race_ethnicity:     [],
    follower_count:     0,
    created_at:         serverTimestamp(),
    updated_at:         serverTimestamp(),
  });

  await setDoc(doc(db, 'users', uid), {
    uid,
    user_type:  'comedian',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return { status: 'created', userType: 'comedian', docId: uid };
}

async function createFanProfile(uid: string): Promise<SignupResult> {
  await setDoc(doc(db, 'users', uid), {
    uid,
    user_type:      'fan',
    display_name:   '',
    location:       '',
    comedy_styles:  [],
    comedy_vibes:   [],
    comedy_themes:  [],
    created_at:     serverTimestamp(),
    updated_at:     serverTimestamp(),
  });
  return { status: 'created', userType: 'fan', docId: uid };
}

async function createOrganizerProfile(uid: string): Promise<SignupResult> {
  await setDoc(doc(db, 'users', uid), {
    uid,
    user_type:     'organizer',
    display_name:  '',
    location:      '',
    comedy_styles: [],
    comedy_vibes:  [],
    created_at:    serverTimestamp(),
    updated_at:    serverTimestamp(),
  });

  await setDoc(doc(db, 'organizers', uid), {
    uid,
    display_name:              '',
    contact_email:             '',
    phone:                     '',
    city:                      '',
    state:                     '',
    bio:                       '',
    show_types:                [],
    gig_type:                  [],
    referral_source:           '',
    terms_agreement:           false,
    organizer_roles:           [],
    is_public:                 true,
    booking_styles:            [],
    booking_vibes:             [],
    booking_experience_levels: [],
    created_at:                serverTimestamp(),
    updated_at:                serverTimestamp(),
  });

  return { status: 'created', userType: 'organizer', docId: uid };
}
