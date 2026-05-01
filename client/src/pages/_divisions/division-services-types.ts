/**
 * Shared types for the new richer "Our Services" catalog used by the
 * Bizdoc / Scalar / Medialy division portals.
 *
 * Source of truth for the shape: /Users/MAC/Downloads/bizdoc-services-v3-4.html
 */

export type ServiceItem = {
  id: string;
  /** Service display name */
  name: string;
  /** What it's for, one short line */
  use: string;
  /** Exact fee, e.g. "₦150,000" or "Quote on request" */
  fee: string;
  /** Timeline, e.g. "5-7 working days" */
  timeline: string;
  /** What the client must provide */
  need: string;
  /** Optional small chip rendered next to the name (e.g. "Renewal", "Free", "Guide") */
  tag?: string;
  /** Optional clarifying note, shown small below the educational layer */
  note?: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  intro?: string;
  items: ServiceItem[];
};

export type IndustryPath = {
  id: string;
  name: string;
  intro: string;
  emoji?: string;
  /** IDs of services that already live inside `categories` — duplication is intentional */
  itemIds: string[];
};

export type DivisionServicesCatalog = {
  categories: ServiceCategory[];
  industries?: IndustryPath[];
};
