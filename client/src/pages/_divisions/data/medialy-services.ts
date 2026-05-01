/**
 * Medialy services catalog — Bizdoc shape ported to media work.
 * status: "draft" — every fee/timeline is a Nigerian-market estimate.
 *
 * TODO verify with founder — every fee in this file is an estimate.
 */
import type { DivisionServicesCatalog, ServiceItem } from "../division-services-types";

const branding: ServiceItem[] = [
  { id: "brand_identity", name: "Brand Identity (logo, type, colour)", use: "The full visual identity — logo, type, colour, the lot. The way your brand looks everywhere.", fee: "₦350,000", timeline: "Three to four weeks.", need: "A brand brief, mood references, and who you're talking to." }, // TODO verify with founder
  { id: "brand_guidelines", name: "Brand Guidelines Document", use: "The rulebook so anyone using your brand — designers, freelancers, your team — gets it right.", fee: "₦120,000", timeline: "One to two weeks.", need: "Your final logo and identity assets." }, // TODO verify with founder
  { id: "brand_voice", name: "Brand Voice + Messaging", use: "How your brand sounds in writing, plus the core lines you'll repeat everywhere.", fee: "₦150,000", timeline: "One to two weeks.", need: "Your audience, a quick competitor scan, and any writing you've already done." }, // TODO verify with founder
  { id: "brand_naming", name: "Naming + Tagline", use: "We'll concept and name a new brand or product — and craft the tagline that lands it.", fee: "₦200,000", timeline: "About two weeks.", need: "A brief, your audience, and where you sit in the market." }, // TODO verify with founder
  { id: "brand_refresh", name: "Brand Refresh", use: "Modernise an older brand without scrapping everything you've built.", fee: "₦220,000", timeline: "Two to three weeks.", need: "Your current assets and what's not working anymore." }, // TODO verify with founder
];

const social: ServiceItem[] = [
  { id: "social_strategy", name: "Monthly Content Strategy", use: "The themes, pillars, and calendar that turn random posting into a plan.", fee: "₦80,000", timeline: "About a week.", need: "Your brand, audience, and goals for the month." }, // TODO verify with founder
  { id: "social_calendar", name: "Content Calendar Planning", use: "A per-platform calendar with post types and dates — so your team knows what's coming.", fee: "₦60,000/month", timeline: "Ongoing.", need: "An approved strategy to plan against." }, // TODO verify with founder
  { id: "social_posts", name: "Feed Posts (carousels, flyers)", use: "Designed posts ready to publish — captions and visuals, on brand.", fee: "₦8,000 per post", timeline: "Two to three days each.", need: "A caption brief and your brand assets." }, // TODO verify with founder
  { id: "social_stories", name: "Daily Stories + Highlights", use: "Daily story content plus the saved highlights that live on your profile.", fee: "₦40,000/month", timeline: "Ongoing.", need: "Brand assets and a quick daily input from you." }, // TODO verify with founder
  { id: "social_community", name: "Community Management", use: "We reply to DMs, comments, and mentions so nobody waits days for an answer.", fee: "₦80,000/month", timeline: "Ongoing.", need: "A reply tone guide and how to escalate the tricky stuff." }, // TODO verify with founder
  { id: "social_management_full", name: "Full Social Media Management", use: "The whole thing — strategy, posts, stories, community — for two platforms.", fee: "₦250,000/month", timeline: "Live within a week.", need: "Brand assets, a calendar, and login access." }, // TODO verify with founder
  { id: "social_paid_ads", name: "Paid Ads Management", use: "Meta and TikTok ads, with reporting that explains what's actually working.", fee: "₦150,000/month + ad spend", timeline: "Ongoing.", need: "Your goal, your audience, and a monthly ad budget.", tag: "ADD-ON" }, // TODO verify with founder
];

const content: ServiceItem[] = [
  { id: "content_caption", name: "Caption Writing + Hashtags", use: "Branded captions with hashtags that have actually been researched, not guessed.", fee: "₦40,000/month", timeline: "Ongoing.", need: "Your brand voice and the post calendar." }, // TODO verify with founder
  { id: "content_blog", name: "Blog / Article Writing", use: "An SEO blog post — researched, edited, and published. The sort Google rewards.", fee: "₦35,000 per post", timeline: "Three to five days each.", need: "A topic, target keyword, and who the post is for." }, // TODO verify with founder
  { id: "content_email_news", name: "Email Newsletter Writing", use: "A weekly or monthly branded newsletter your readers actually open.", fee: "₦60,000/month", timeline: "Ongoing.", need: "Your email list and brand voice." }, // TODO verify with founder
  { id: "content_scripts", name: "Video Scripts", use: "Hook-led scripts for reels and YouTube — written so people don't scroll past.", fee: "₦25,000 per script", timeline: "Two to three days each.", need: "A topic, your host's style, and how long it should be." }, // TODO verify with founder
  { id: "content_audience_research", name: "Audience Research + Personas", use: "A deep persona document so your content speaks to real people, not assumptions.", fee: "₦120,000", timeline: "About two weeks.", need: "A brand brief and access to a few customers we can interview." }, // TODO verify with founder
];

const video: ServiceItem[] = [
  { id: "video_reel", name: "Reels / TikToks", use: "Short-form vertical edits — the kind that get reshared.", fee: "₦25,000 per reel", timeline: "Three to five days each.", need: "Either footage or a brief if we're filming." }, // TODO verify with founder
  { id: "video_corporate", name: "Corporate / Brand Video", use: "Concept-to-delivery branded video — the centrepiece for your homepage or campaign.", fee: "Starts from ₦600,000", timeline: "Three to five weeks.", need: "A brief, location ideas, and who you want on camera." }, // TODO verify with founder
  { id: "video_explainer", name: "Explainer / Animated Video", use: "60-90 second motion-graphic explainer — for when your product needs context to make sense.", fee: "₦400,000", timeline: "Three to four weeks.", need: "A script and your brand assets." }, // TODO verify with founder
  { id: "video_event", name: "Event Coverage", use: "Full-day filming, plus an edit and a highlight reel you can share by Monday.", fee: "Starts from ₦450,000", timeline: "One to two weeks for delivery.", need: "Event date, location, and a run-of-show." }, // TODO verify with founder
  { id: "video_editing_only", name: "Video Editing (footage supplied)", use: "You film, we edit. Polished finals from your raw footage.", fee: "₦60,000 per finished minute", timeline: "About a week.", need: "Raw footage, a brief, and any references you love." }, // TODO verify with founder
  { id: "video_voiceover", name: "Voice-Over Production", use: "Studio-recorded voice-over with a proper mix — not someone's bedroom mic.", fee: "₦80,000", timeline: "About a week.", need: "Your final script and the direction for the voice." }, // TODO verify with founder
];

const podcast_production: ServiceItem[] = [
  { id: "podcast_concept", name: "Podcast Concept Development", use: "We figure out the format, audience, and first six episodes — before you spend a kobo on recording.", fee: "₦150,000", timeline: "About two weeks.", need: "Your brand, the host, and a hunch about who'll listen." }, // TODO verify with founder
  { id: "podcast_recording", name: "In-Studio Recording Session", use: "A per-episode studio session in a treated room with proper mics.", fee: "₦120,000 per episode", timeline: "Same day.", need: "Your episode plan and guest details." }, // TODO verify with founder
  { id: "podcast_edit", name: "Podcast Editing + Mastering", use: "Post-production audio engineering — the bit that makes amateurs sound professional.", fee: "₦60,000 per episode", timeline: "Three to five days each.", need: "Your raw audio files." }, // TODO verify with founder
  { id: "podcast_video_clips", name: "Video Clips for Social", use: "Five to seven short clips per episode — so the conversation lives on social, not just on Spotify.", fee: "₦80,000 per episode", timeline: "About five days.", need: "The filmed episode." }, // TODO verify with founder
  { id: "podcast_show_notes", name: "Show Notes + Transcripts", use: "Branded show notes and a full transcript — good for SEO, accessibility, and lazy listeners.", fee: "₦20,000 per episode", timeline: "Three days.", need: "Your final episode audio." }, // TODO verify with founder
];

const photography: ServiceItem[] = [
  { id: "photo_product", name: "Product Photography", use: "A studio shoot for ecommerce listings — clean, consistent, and ready for any platform.", fee: "₦8,000 per SKU", timeline: "One to two days for the shoot, about a week for delivery.", need: "Your products shipped to the studio." }, // TODO verify with founder
  { id: "photo_lookbook", name: "Brand Lookbook / Editorial", use: "A concept-led editorial shoot — for when product shots aren't enough and you need a story.", fee: "Starts from ₦450,000", timeline: "Two to three weeks.", need: "A concept, location, and talent." }, // TODO verify with founder
  { id: "photo_corporate", name: "Corporate Headshots", use: "Team headshots in a consistent style — no more mismatched LinkedIn photos.", fee: "₦15,000 per person", timeline: "Same day.", need: "Team count, location, and a quick dress code." }, // TODO verify with founder
  { id: "photo_event", name: "Event Photography", use: "Full event coverage and an edited gallery you can hand to attendees and press.", fee: "Starts from ₦200,000", timeline: "About a week for delivery.", need: "Date, venue, and a run-of-show." }, // TODO verify with founder
];

const motion_graphics: ServiceItem[] = [
  { id: "motion_logo_anim", name: "Logo Animation", use: "A branded animated logo sting — the bit at the start of every video your team makes.", fee: "₦80,000", timeline: "About a week.", need: "Your final logo files." }, // TODO verify with founder
  { id: "motion_explainer", name: "Motion Explainer", use: "A 30-60 second motion-graphic with voice-over — for explaining things words alone can't.", fee: "₦300,000", timeline: "About three weeks.", need: "A script and your brand assets." }, // TODO verify with founder
  { id: "motion_lower_thirds", name: "Lower Thirds + Title Pack", use: "A reusable title pack any video editor on your team can drop in.", fee: "₦60,000", timeline: "About a week.", need: "Your brand guide and a few sample frames." }, // TODO verify with founder
];

const analytics: ServiceItem[] = [
  { id: "analytics_monthly", name: "Monthly Performance Report", use: "A branded report that tells you what worked last month — in English, not just numbers.", fee: "₦40,000/month", timeline: "First week of the next month.", need: "Access to your platforms." }, // TODO verify with founder
  { id: "analytics_competitor", name: "Competitor Analysis", use: "A deep dive into three to five competitors — what they're doing, what's working, where the gaps are.", fee: "₦100,000", timeline: "One to two weeks.", need: "Your competitor list and the areas you want us to focus on." }, // TODO verify with founder
  { id: "analytics_audit", name: "Social Media Audit", use: "An audit of every platform you're on, with an action plan for the next quarter.", fee: "₦80,000", timeline: "About a week.", need: "Profile access and what you're trying to achieve." }, // TODO verify with founder
];

const industries = [
  { id: "founder_personal_brand", name: "Founder Personal Brand", emoji: "🧑‍💼", intro: "Build a recognisable founder voice across LinkedIn and IG.", itemIds: ["brand_voice","social_strategy","social_management_full","content_blog","video_reel","analytics_monthly"] },
  { id: "lifestyle_brand", name: "Lifestyle / Consumer Brand", emoji: "💄", intro: "Visual brand + social presence for a consumer product.", itemIds: ["brand_identity","brand_guidelines","social_management_full","photo_product","photo_lookbook","video_reel"] },
  { id: "podcast_launch", name: "Podcast Launch", emoji: "🎙", intro: "Concept to first 6 episodes — branded, edited, distributed.", itemIds: ["podcast_concept","podcast_recording","podcast_edit","podcast_video_clips","podcast_show_notes","brand_identity"] },
  { id: "event_coverage", name: "Event Coverage Package", emoji: "🎉", intro: "Photography, videography, social posting around an event.", itemIds: ["photo_event","video_event","social_posts","social_stories"] },
  { id: "ecommerce_brand", name: "E-commerce Brand Visuals", emoji: "🛒", intro: "Product shots, motion ads, and platform visuals.", itemIds: ["photo_product","video_reel","motion_explainer","social_management_full","social_paid_ads"] },
  { id: "corporate_authority", name: "Corporate Authority Build", emoji: "🏢", intro: "Authority content — thought leadership across channels.", itemIds: ["brand_voice","content_blog","content_email_news","video_corporate","analytics_monthly","analytics_competitor"] },
];

export const medialyServicesCatalog: DivisionServicesCatalog = {
  categories: [
    { id: "branding", name: "Branding & Identity", intro: "How your business looks, sounds, and feels.", items: branding },
    { id: "social", name: "Social Media Management", intro: "Strategy, posting, community — every day.", items: social },
    { id: "content", name: "Content Creation", intro: "Captions, blogs, scripts, newsletters.", items: content },
    { id: "video", name: "Video Production", intro: "Concept-to-delivery video for ads, brand, and social.", items: video },
    { id: "podcast_production", name: "Podcast Production", intro: "Concept, recording, edit, and distribution.", items: podcast_production },
    { id: "photography", name: "Photography", intro: "Product, editorial, corporate, event.", items: photography },
    { id: "motion_graphics", name: "Motion Graphics", intro: "Animated logos, explainers, title packs.", items: motion_graphics },
    { id: "analytics", name: "Analytics & Reporting", intro: "What worked, what didn't, what next.", items: analytics },
  ],
  industries,
};
