const functions = require('firebase-functions');
const admin     = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

function requireAuth(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be signed in to perform this action.'
    );
  }
}

function requireVerifiedAuth(context) {
  requireAuth(context);
  if (!context.auth.token.email_verified) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Please verify your email address before completing your profile.'
    );
  }
}

async function findExistingProfile(uid) {
  // All user types now have a /users doc, so one lookup covers everyone
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists) {
    const data = userDoc.data();
    return { exists: true, userType: data.user_type, docId: uid };
  }

  return { exists: false };
}

exports.handleUserSignup = functions.https.onCall(async (data, context) => {
  requireVerifiedAuth(context);

  const uid      = context.auth.uid;
  const email    = context.auth.token.email.toLowerCase();
  const userType = data.userType;

  if (!['fan', 'comedian', 'organizer'].includes(userType)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userType must be "fan", "comedian", or "organizer".'
    );
  }

  const existing = await findExistingProfile(uid);
  if (existing.exists) {
    return {
      status:   'already_exists',
      userType: existing.userType,
      docId:    existing.docId,
    };
  }

  switch (userType) {
    case 'comedian':  return createOrClaimComedianProfile(uid, email);
    case 'fan':       return createFanProfile(uid);
    case 'organizer': return createOrganizerProfile(uid);
  }
});

async function createOrClaimComedianProfile(uid, email) {
  const claimQuery = await db.collection('comedians')
    .where('comedian_email', '==', email)
    .where('claimed', '==', false)
    .limit(1)
    .get();

  const now = admin.firestore.FieldValue.serverTimestamp();

  // --- Claim existing roster profile ---
  if (!claimQuery.empty) {
    const existingDoc = claimQuery.docs[0];

    await existingDoc.ref.update({
      uid:        uid,
      claimed:    true,
      claimed_at: now,
      updated_at: now,
    });

    await db.collection('users').doc(uid).set({
      uid:        uid,
      user_type:  'comedian',
      created_at: now,
      updated_at: now,
    });

    return {
      status:   'claimed',
      userType: 'comedian',
      docId:    existingDoc.id,
      isNew:    false,
    };
  }

  // --- Create new comedian profile ---
  const newDocRef = db.collection('comedians').doc(uid);

  await newDocRef.set({
    uid:                uid,
    user_type:          'comedian',
    claimed:            true,
    claimed_at:         now,
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
    current_city:       '',
    slug:               '',
    experience_level:   null,
    comedy_styles:      [],
    comedy_vibes:       [],
    comedy_themes:      [],
    set_lengths:        [],
    rate_range:         null,
    payment_methods:    [],
    languages_spoken:   [],
    share_demographics: false,
    follower_count:     0,
    created_at:         now,
    updated_at:         now,
  });

  await db.collection('users').doc(uid).set({
    uid:        uid,
    user_type:  'comedian',
    created_at: now,
    updated_at: now,
  });

  return {
    status:   'created',
    userType: 'comedian',
    docId:    uid,
    isNew:    true,
  };
}

async function createFanProfile(uid) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection('users').doc(uid).set({
    uid:            uid,
    user_type:      'fan',
    display_name:   '',
    location:       '',
    comedy_styles:  [],
    comedy_vibes:   [],
    comedy_themes:  [],
    created_at:     now,
    updated_at:     now,
  });

  return { status: 'created', userType: 'fan', docId: uid };
}

async function createOrganizerProfile(uid) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection('users').doc(uid).set({
    uid:           uid,
    user_type:     'organizer',
    display_name:  '',
    location:      '',
    comedy_styles: [],
    comedy_vibes:  [],
    created_at:    now,
    updated_at:    now,
  });

  await db.collection('organizers').doc(uid).set({
    uid:             uid,
    display_name:    '',
    phone:           '',
    city:            '',
    state:           '',
    bio:             '',
    show_types:      [],
    gig_type:        [],
    referral_source: '',
    terms_agreement: false,
    organizer_roles: [],
    created_at:      now,
    updated_at:      now,
  });

  return { status: 'created', userType: 'organizer', docId: uid };
}

exports.getUserProfile = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const result = await findExistingProfile(context.auth.uid);

  if (result.exists) {
    return { found: true, userType: result.userType, docId: result.docId };
  }

  return { found: false };
});
