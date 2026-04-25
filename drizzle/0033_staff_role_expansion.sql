-- Staff role enum expansion — adds 10 new role values for division-specific
-- leads/staff (Scalar, Medialy, Podcast, Video, Faceless). Required so
-- App.tsx ROLE_ACCESS gates and server ROLE_DASHBOARDS map have real
-- enum values to assign to staff. Existing rows preserved (only ADDS to
-- enum, no rows are touched, no data loss).
--
-- New roles added:
--   scalar_lead, scalar_staff
--   medialy_lead, medialy_staff
--   podcast_lead, podcast_staff
--   video_lead, video_staff
--   faceless_lead, faceless_staff

ALTER TABLE `staffUsers` MODIFY COLUMN `staffHamzuryRole` ENUM(
  'founder',
  'ceo',
  'cso',
  'cso_staff',
  'finance',
  'hr',
  'bizdev',
  'bizdev_staff',
  'media',
  'skills_staff',
  'systemise_head',
  'tech_lead',
  'compliance_staff',
  'security_staff',
  'department_staff',
  'scalar_lead',
  'scalar_staff',
  'medialy_lead',
  'medialy_staff',
  'podcast_lead',
  'podcast_staff',
  'video_lead',
  'video_staff',
  'faceless_lead',
  'faceless_staff'
) NOT NULL;
