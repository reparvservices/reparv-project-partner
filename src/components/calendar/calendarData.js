export const CALENDAR_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const CAL_FILTERS   = ["All", "Meetings", "Site Visits", "Follow-ups"];
export const VIEW_OPTIONS  = ["Today", "Month", "Week", "Day"];
export const NAV_TABS      = ["Schedule", "Notes"];

export const FILTER_TYPE_MAP = {
  All: "all", Meetings: "meeting", "Site Visits": "visit", "Follow-ups": "followup",
};

export const MONTH_LABEL     = "October 2023";
export const DAYS_IN_MONTH   = 31;
export const FIRST_DAY_OFFSET = 6; // Oct 1 = Sunday → offset 6 in Mon–Sun grid
export const TODAY_DATE      = 11;

export const EVENTS = {
  2:  [{ id:1,  label:"Review: Skyline",     type:"meeting",  color:"#7C3AED", bg:"#EDE9FE" }],
  3:  [{ id:2,  label:"Visit: Green Valley", type:"visit",    color:"#059669", bg:"#D1FAE5" },
       { id:3,  label:"Doc Prep",            type:"task",     color:"#6366F1", bg:"#E0E7FF" }],
  5:  [{ id:4,  label:"Call: Mr. Sharma",    type:"followup", color:"#EA580C", bg:"#FEE2E2" }],
  6:  [{ id:5,  label:"Team Sync",           type:"meeting",  color:"#6366F1", bg:"#E0E7FF" }],
  9:  [{ id:6,  label:"Insp: Block A",       type:"visit",    color:"#059669", bg:"#D1FAE5" }],
  11: [{ id:7,  label:"Client Meeting",      type:"meeting",  color:"#7C3AED", bg:"#EDE9FE" },
       { id:8,  label:"Site Visit: Plot 4",  type:"visit",    color:"#059669", bg:"#D1FAE5" }],
  12: [{ id:9,  label:"Lead Follow-up",      type:"followup", color:"#EA580C", bg:"#FEE2E2" }],
  13: [{ id:10, label:"Report Due",          type:"task",     color:"#6366F1", bg:"#E0E7FF" }],
  17: [{ id:11, label:"Design Review",       type:"meeting",  color:"#7C3AED", bg:"#EDE9FE" }],
  19: [{ id:12, label:"Final Insp",          type:"visit",    color:"#059669", bg:"#D1FAE5" }],
};

export const STAT_CARDS = [
  { label:"Today's Meetings",       value:"5",  iconBg:"bg-violet-100",  iconKey:"users" },
  { label:"Site Visits Scheduled",  value:"12", iconBg:"bg-emerald-100", iconKey:"map"   },
  { label:"Property Follow-ups",    value:"8",  iconBg:"bg-orange-100",  iconKey:"phone" },
  { label:"Internal Tasks",         value:"3",  iconBg:"bg-indigo-100",  iconKey:"check" },
];

export const DAY_PANEL_DATA = {
  meetings: [{
    time:"10:00", period:"AM",
    title:"Client Meeting: Mr. Verma",
    sub:"Office HQ, Conf Room 1", subIcon:"location",
    accent:"border-violet-600", avatar:"MV",
  }],
  siteVisits: [{
    time:"02:30", period:"PM",
    title:"Skyline Towers - Block B",
    sub:"Progress Inspection", subIcon:"building",
    accent:"border-emerald-600", attendee:"+ Rajesh K.",
  }],
  tasks: [{
    time:"05:00", period:"PM",
    title:"Call Leads (5 Pending)",
    sub:"Sales CRM", subIcon:"phone",
    accent:"border-orange-500",
  }],
};
