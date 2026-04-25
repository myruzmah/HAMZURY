-- Founder directive 2026-04-26: CEO and HUB Admin must be separate
-- logins, even if same person manages both.

-- 1. Move Idris's existing record from ceo@hamzury.com → idris@hamzury.com.
--    He stays as Hub Admin (skills_staff). Defensively re-set role.
UPDATE staffUsers
  SET email = 'idris@hamzury.com', staffHamzuryRole = 'skills_staff'
  WHERE staffRef = 'HMZ-0002-02';

-- 2. Create a separate CEO login at ceo@hamzury.com (role=ceo).
--    Same person Idris, different account. Default password Hamzury@2026
--    forces a password change on first login.
INSERT INTO staffUsers
  (staffRef, email, passwordHash, passwordSalt, name, staffHamzuryRole,
   isActive, firstLogin, passwordChanged, failedAttempts, createdAt, updatedAt)
VALUES
  ('HMZ-0019-02', 'ceo@hamzury.com',
   '21ce026b436836c3035801c518074ea041af0c73ef02feb48f7f773532781ac8e8b87d4e72f0d31c4637a334e103215cd4943de3b80bb96e66f3cd8e444b5189',
   '04019f66d2fdbbb0ba47a9c62cdfb8cb26d95551ade1d3698cce5c6eb799d089',
   'Idris Ibrahim (CEO)', 'ceo',
   1, 1, 0, 0, NOW(), NOW());
