export type TenantPublic = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  reward_title: string;
  reward_description: string | null;
  visits_required: number;
  default_country: "52" | "1";
};

export type Tenant = TenantPublic & {
  one_visit_per_day: boolean;
  timezone: string;
  active: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  pin: string;
  card_token: string;
  visit_count: number;
  total_visits: number;
  redemptions: number;
  last_visit_at: string | null;
  created_at: string;
};

export type VisitEvent = {
  id: number;
  kind: "visit" | "redeem";
  note: string | null;
  created_at: string;
};

export type Card = {
  name: string;
  visit_count: number;
  total_visits: number;
  redemptions: number;
  last_visit_at: string | null;
  visits_required: number;
  reward_title: string;
  reward_description: string | null;
  history: { kind: "visit" | "redeem"; note: string | null; created_at: string }[];
};

export type Role = "admin" | "staff";
