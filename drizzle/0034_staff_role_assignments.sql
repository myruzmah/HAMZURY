-- Staff role assignments — aligns DB roles with the founder's spec
-- ("/Users/MAC/Desktop/HAMZURY SITE/original files/").
--
-- Decisions, by spec evidence:
--   * Khadija Saad → hr        (Phase 2: "HR SETUP (Khadija Saad)")
--   * Abubakar Sadiq → finance (Phase 2: "FINANCE SETUP (Abubakar Sadiq)") — already finance, no change
--   * Sulaiman Hikma → medialy_lead (Phase 3: "Hikma Suleiman (Lead)")
--   * Salis → video_lead       (Phase 3 & Phase 8: "Salis (Video Unit)")
--   * Dajot → scalar_lead      (Phase 5: "Led by Dajot and Felix")
--   * Abdulwafeed Tanko → scalar_staff (Felix not in DB; Abdulwafeed is the only other tech_lead)
--   * Idris Ibrahim → skills_staff (Phase 7: "LEAD: Idris" for HUB)
--   * Abdullahi Musa → compliance_staff (Phase 6: "LEADS: Yusuf + Abdullahi" for Bizdoc)
--   * Habeeba → podcast_staff  (Phase 8: "Habeeba (Production)" on Podcast/Faceless)
--
-- Untouched (already correct or not named in spec):
--   * Muhammad Hamzury (founder)
--   * Tabitha John (cso) — second CSO seat, no spec direction
--   * Maryam Ashir Lalo (cso) — Phase 4: CSO Lead, plus Phase 8 Podcast/Faceless lead.
--     Primary stays cso. (One role per staff in this enum.)
--   * Yusuf Haruna (compliance_staff) — Phase 6 Bizdoc lead, already correct
--   * Rabilu Musa (security_staff) — not in spec, role is correct
--   * Abdulmalik Musa (skills_staff) — Phase 7 MetFix lead under HUB, correct
--   * Farida Munir (bizdev) — not in spec; spec names "Isa Ibrahim" (not in DB) as BizDev Lead
--   * Lalo (department_staff) — not in spec
--   * Pius Emmanuel (department_staff) — not in spec
--
-- Also backfills 3 NULL staffRefs:
--   * Idris Ibrahim   → HMZ-0002-02
--   * Abubakar Sadiq  → HMZ-0005-04
--   * Khadija Saad    → HMZ-0009-05

-- Role updates
UPDATE `staffUsers` SET `staffHamzuryRole` = 'hr'             WHERE `email` = 'bizdev@hamzury.com';      -- Khadija Saad → hr
UPDATE `staffUsers` SET `staffHamzuryRole` = 'medialy_lead'   WHERE `email` = 'hikma@hamzury.com';        -- Sulaiman Hikma
UPDATE `staffUsers` SET `staffHamzuryRole` = 'video_lead'     WHERE `email` = 'salis@hamzury.com';        -- Salis
UPDATE `staffUsers` SET `staffHamzuryRole` = 'scalar_lead'    WHERE `email` = 'dajot@hamzury.com';        -- Dajot
UPDATE `staffUsers` SET `staffHamzuryRole` = 'scalar_staff'   WHERE `email` = 'abdulwafeed@hamzury.com';  -- Abdulwafeed Tanko
UPDATE `staffUsers` SET `staffHamzuryRole` = 'skills_staff'   WHERE `email` = 'ceo@hamzury.com';          -- Idris Ibrahim → HUB
UPDATE `staffUsers` SET `staffHamzuryRole` = 'compliance_staff' WHERE `email` = 'abdullahi@hamzury.com';  -- Abdullahi Musa → Bizdoc
UPDATE `staffUsers` SET `staffHamzuryRole` = 'podcast_staff'  WHERE `email` = 'habeeba@hamzury.com';      -- Habeeba → podcast/faceless production

-- StaffRef backfills (only fill rows where current value is NULL)
UPDATE `staffUsers` SET `staffRef` = 'HMZ-0002-02' WHERE `email` = 'ceo@hamzury.com'      AND `staffRef` IS NULL;
UPDATE `staffUsers` SET `staffRef` = 'HMZ-0005-04' WHERE `email` = 'finance@hamzury.com'  AND `staffRef` IS NULL;
UPDATE `staffUsers` SET `staffRef` = 'HMZ-0009-05' WHERE `email` = 'bizdev@hamzury.com'   AND `staffRef` IS NULL;
