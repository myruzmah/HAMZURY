-- Spec compliance: delete staff not named in /Users/MAC/Desktop/HAMZURY SITE/original files
-- Founder directive 2026-04: "everything not according to original files, delete permanently"
-- Spec citations:
--   - PHASE2: Khadija (HR), Abubakar (Finance)
--   - PHASE3 README: Hikma, Ahmad, Salis (Medialy team)
--   - PHASE4 README: Maryam Lalo (CSO), Isa Ibrahim (BizDev)
--   - PHASE5 README: Dajot + Felix (Scalar)
--   - PHASE6: Yusuf + Abdullahi (Bizdoc)
--   - PHASE7 README: Idris, Dajot, Isa, Musa, Abdulmalik (Hub)
--   - PHASE8 README: Maryam + Habeeba (Podcast/Faceless), Salis (Video)

DELETE FROM staffUsers WHERE email = 'tabitha@hamzury.com';
DELETE FROM staffUsers WHERE email = 'faree@hamzury.com';        -- Farida Munir
DELETE FROM staffUsers WHERE email = 'abdulwafeed@hamzury.com';
DELETE FROM staffUsers WHERE email = 'rabilu@hamzury.com';
DELETE FROM staffUsers WHERE email = 'lalo@hamzury.com';
DELETE FROM staffUsers WHERE email = 'pius@hamzury.com';

-- Per-spec name correction: "Maryam Ashir Lalo" → "Maryam Lalo"
UPDATE staffUsers SET name = 'Maryam Lalo' WHERE email = 'cso@hamzury.com';
