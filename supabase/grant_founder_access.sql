-- RUN THIS IN SUPABASE SQL EDITOR
-- Grants full ADMIN privileges to the founder email.
UPDATE public.user_profiles
SET role = 'ADMIN_INTERNAL',
    subscription_tier = 'enterprise'
FROM auth.users
WHERE public.user_profiles.id = auth.users.id
    AND auth.users.email = 'bkalan169@gmail.com';
-- Verification
SELECT email,
    role,
    subscription_tier
FROM public.user_profiles
    JOIN auth.users ON public.user_profiles.id = auth.users.id
WHERE email = 'bkalan169@gmail.com';