
export enum PageType {
  HOME = 'home',
  COMEDIANS = 'comedians',
  CORPORATE = 'corporate',
  LIST_EVENT = 'list_event',
  CONTACT = 'contact',
  LEADERBOARDS = 'leaderboards',
  OPPORTUNITIES = 'opportunities',
  DASHBOARD = 'dashboard',
  SCENES = 'scenes',
  HOW_TO_GET_GIGS = 'how_to_get_gigs',
  ORGANIZER_GETTING_STARTED = 'organizer_getting_started',
  FAN_GETTING_STARTED = 'fan_getting_started',
  REVENUE_TICKETING = 'revenue_ticketing',
  DIGITAL_ENGAGEMENT = 'digital_engagement',
  ORGANIZER_MANAGEMENT_CENTER = 'organizer_management_center'
}

export type UserRole = 'fan' | 'comedian' | 'venue' | 'organizer';

export interface Comedian {
  id: string;
  name: string;
  type: string;
  videoUrl?: string;
  location: string;
  rating: number;
  points: number;
  rank: number;
}

export interface EventListing {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  type: 'one-off' | 'multiple';
  ticketUrl?: string;
  price?: string;
  isNative?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  venue: string;
  location: string;
  date: string;
  budget: string;
  requirements: string;
  type: 'spot' | 'writing' | 'corporate';
}
