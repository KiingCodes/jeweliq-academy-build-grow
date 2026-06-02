
-- Wipe coding course content and seed Digital Entrepreneurship curriculum
DELETE FROM public.quizzes;
DELETE FROM public.lesson_progress;
DELETE FROM public.bookmarks;
DELETE FROM public.lesson_notes;
DELETE FROM public.enrollments;
DELETE FROM public.lessons;
DELETE FROM public.certificates;
DELETE FROM public.courses;

-- Insert new Digital Entrepreneurship courses
INSERT INTO public.courses (id, slug, title, description, category, level, thumbnail_hue, duration_minutes, is_published) VALUES
  ('11111111-1111-1111-1111-111111111101', 'digital-entrepreneurship-foundations', 'Digital Entrepreneurship Foundations', 'From idea to first sale. Learn the mindset, frameworks, and tools every modern founder needs to launch online.', 'Foundations', 'beginner', '255', 240, true),
  ('11111111-1111-1111-1111-111111111102', 'finding-validating-ideas', 'Finding & Validating Profitable Ideas', 'Spot real market opportunities, run lean validation experiments, and pick the idea worth building.', 'Strategy', 'beginner', '210', 180, true),
  ('11111111-1111-1111-1111-111111111103', 'building-personal-brand', 'Building a Magnetic Personal Brand', 'Position yourself as the go-to expert. Craft your story, content pillars, and a brand that attracts opportunities.', 'Branding', 'beginner', '40', 200, true),
  ('11111111-1111-1111-1111-111111111104', 'social-media-growth', 'Social Media Growth Playbook', 'Grow on Instagram, TikTok, YouTube, and X with content systems that convert followers into customers.', 'Marketing', 'intermediate', '60', 260, true),
  ('11111111-1111-1111-1111-111111111105', 'sales-funnels-conversion', 'Sales Funnels & Conversion', 'Design offers, landing pages, email sequences, and checkout flows that actually convert.', 'Sales', 'intermediate', '15', 220, true),
  ('11111111-1111-1111-1111-111111111106', 'monetize-digital-products', 'Monetize with Digital Products', 'Ebooks, courses, templates, memberships — package your knowledge into scalable digital income.', 'Products', 'intermediate', '120', 240, true),
  ('11111111-1111-1111-1111-111111111107', 'ecommerce-dropshipping', 'E-commerce & Dropshipping Mastery', 'Build a profitable Shopify store, source winning products, and run ads that print profit.', 'E-commerce', 'advanced', '30', 300, true),
  ('11111111-1111-1111-1111-111111111108', 'scaling-systems-team', 'Scaling: Systems, Team & Freedom', 'Move from solo hustler to CEO. Build SOPs, hire VAs, automate operations, and reclaim your time.', 'Scale', 'advanced', '90', 280, true);

-- Lessons (reading + media types). Use markdown-friendly plain text in content.
INSERT INTO public.lessons (course_id, title, content, lesson_type, order_index, duration_minutes, difficulty) VALUES
-- Course 1: Foundations
('11111111-1111-1111-1111-111111111101', 'Welcome to Digital Entrepreneurship', 'Digital entrepreneurship is the art of building location-independent businesses using the internet as your storefront, factory, and distribution channel.

In this course you will learn:
• The 5 timeless principles of online businesses
• How to choose a model that fits your lifestyle
• A 90-day launch roadmap

This is hands-on. By the end of week one you will have a one-page business plan and a public landing page collecting emails.', 'reading', 0, 8, 'beginner'),
('11111111-1111-1111-1111-111111111101', 'The Entrepreneur Mindset', 'Skills can be learned. Mindset is the multiplier.

Three mental shifts that separate operators from dreamers:
1. Bias for action — ship ugly, iterate fast.
2. Ownership — no excuses, only experiments.
3. Compounding — small daily reps beat heroic sprints.

Reflection: write 3 sentences about a problem you experienced this week. Future business ideas hide inside frustrations.', 'reading', 1, 10, 'beginner'),
('11111111-1111-1111-1111-111111111101', 'The 7 Online Business Models', 'Pick one to start. Master it before stacking another.

1. Freelancing / Services
2. Coaching & Consulting
3. Digital Products (ebooks, templates, courses)
4. SaaS / Software
5. E-commerce & Dropshipping
6. Affiliate & Content Sites
7. Communities & Memberships

Each has a different cash-flow curve and skill demand. We will analyze pros, cons, and capital needed for each.', 'reading', 2, 15, 'beginner'),
('11111111-1111-1111-1111-111111111101', 'Crafting Your One-Page Business Plan', 'Forget 40-page documents. A modern founder needs one page that answers:
• Who is the customer?
• What painful problem are you solving?
• What is the offer + price?
• How will they discover you?
• What is the success metric for the next 30 days?

Template provided. Submit yours in the community for feedback.', 'reading', 3, 12, 'beginner'),
('11111111-1111-1111-1111-111111111101', 'Your First 90 Days Roadmap', 'Days 1–30: Choose niche, validate problem, ship landing page.
Days 31–60: Build minimum offer, get first 3 paying customers.
Days 61–90: Systematize delivery, raise prices, double traffic.

Print this. Tape it to your wall. We will check in every two weeks inside the community.', 'reading', 4, 10, 'beginner'),

-- Course 2: Ideas
('11111111-1111-1111-1111-111111111102', 'Where Profitable Ideas Hide', 'Great ideas live at the intersection of: a painful problem, a willing-to-pay audience, and your unfair advantage.

Hunting grounds:
• Reddit niche subs (real complaints)
• Amazon 1-star reviews
• Twitter/X "I wish someone would build…" posts
• Your own daily frustrations

Goal: list 20 problems this week. Quantity unlocks quality.', 'reading', 0, 12, 'beginner'),
('11111111-1111-1111-1111-111111111102', 'The Validation Triangle', 'Before you build anything, validate three things:
1. PROBLEM — do 10 people describe it in their own words?
2. SOLUTION — would they pay today for a fix?
3. CHANNEL — can you reach them affordably?

If any leg is weak, the idea collapses. Run 5 customer interviews this week using the script provided.', 'reading', 1, 15, 'beginner'),
('11111111-1111-1111-1111-111111111102', 'The 48-Hour Landing Page Test', 'Launch a one-page site with: headline, problem, promise, email capture. Drive 100 visitors via 1 paid ad or 5 community posts.

Healthy benchmarks:
• 20%+ email conversion
• 3+ replies asking "when can I buy?"

If you hit those, build. If not, iterate the offer.', 'reading', 2, 12, 'beginner'),
('11111111-1111-1111-1111-111111111102', 'Pricing Your First Offer', 'Cheap kills businesses. So does overpricing without proof.

Framework:
• Anchor on the outcome (what is solving this worth?)
• Compare against alternatives (DIY, hire, competitors)
• Start at 2x your "scary" number — you can always discount, never raise easily.', 'reading', 3, 10, 'beginner'),

-- Course 3: Personal Brand
('11111111-1111-1111-1111-111111111103', 'Why Personal Brand Beats Logos in 2026', 'People buy from people. A clear personal brand reduces ad costs, attracts inbound deals, and compounds for life.

You will leave this course with: a positioning statement, 3 content pillars, and a 30-day content calendar.', 'reading', 0, 8, 'beginner'),
('11111111-1111-1111-1111-111111111103', 'The Positioning Statement Formula', 'I help [WHO] achieve [OUTCOME] through [UNIQUE METHOD].

Examples:
• I help busy moms lose 10kg in 12 weeks through 20-minute home workouts.
• I help solo coaches book 5 high-ticket clients per month through LinkedIn DMs.

Specific beats clever. Niche down until your dream customer says "that is me".', 'reading', 1, 12, 'beginner'),
('11111111-1111-1111-1111-111111111103', 'Your 3 Content Pillars', 'Pick 3 themes you can post about for 5 years:
1. EDUCATION — teach what you know
2. INSPIRATION — share the journey
3. CONVERSION — what you sell + proof

Aim for a 4:1 ratio of value to pitch. Trust first, sell second.', 'reading', 2, 10, 'beginner'),
('11111111-1111-1111-1111-111111111103', 'Your Founder Story', 'Story sells. Craft a 60-second origin story covering: where you were, the breaking point, the discovery, the transformation, the mission.

Use this in: bio, About page, podcast intros, sales calls. Record it on video this week.', 'reading', 3, 12, 'beginner'),

-- Course 4: Social
('11111111-1111-1111-1111-111111111104', 'Choosing Your Primary Platform', 'You cannot be everywhere when starting. Pick ONE based on:
• Where your audience already scrolls
• What format you enjoy creating (short video, long form, photo, text)
• How fast you want results — TikTok/IG Reels are fastest in 2026.

Master one, then expand.', 'reading', 0, 10, 'beginner'),
('11111111-1111-1111-1111-111111111104', 'The Hook is 80% of the Win', 'You have 1.5 seconds before the thumb scrolls. Hooks that work:
• "Nobody talks about this but…"
• "I lost $10k learning this so you don''t have to"
• "The 3 things I wish I knew before quitting my job"

Write 10 hooks before you film anything. Test, iterate, keep the winners.', 'reading', 1, 12, 'intermediate'),
('11111111-1111-1111-1111-111111111104', 'Content Batching System', 'Post daily without burning out:
1. Sunday — brainstorm 14 hooks (2 weeks of content)
2. Monday morning — film all videos in one 90-min session
3. Edit + caption with CapCut + ChatGPT
4. Schedule via Metricool or native scheduler

2 hours of work = 14 days live.', 'reading', 2, 14, 'intermediate'),
('11111111-1111-1111-1111-111111111104', 'Turning Followers into Buyers', 'Followers are vanity, customers are profit.

The funnel:
Content → Profile → Lead Magnet → Email/DM → Offer → Sale

Every viral video should drive to a free resource that captures contact info. We will build your lead magnet next lesson.', 'reading', 3, 12, 'intermediate'),

-- Course 5: Funnels
('11111111-1111-1111-1111-111111111105', 'The Anatomy of a High-Converting Funnel', 'Awareness → Interest → Desire → Action → Retention.

In digital terms:
• Ad / Reel → Landing page → Email sequence → Sales page → Checkout → Onboarding → Upsell.

This course gives you proven templates for each step.', 'reading', 0, 10, 'intermediate'),
('11111111-1111-1111-1111-111111111105', 'Writing Landing Pages That Sell', 'The 7-section formula:
1. Headline with clear outcome
2. Sub-headline with target audience
3. Pain agitation
4. Solution + offer
5. Social proof
6. Risk reversal (guarantee)
7. Clear single CTA

No menus. No distractions. One decision.', 'reading', 1, 15, 'intermediate'),
('11111111-1111-1111-1111-111111111105', 'Email Sequences that Print Money', 'Your 7-email welcome series:
Day 0 — Deliver the freebie + story
Day 1 — Pain & possibility
Day 2 — Case study
Day 3 — Behind-the-scenes
Day 4 — Offer reveal
Day 5 — Objection handling
Day 6 — Last call + bonus

Templates inside the resource pack.', 'reading', 2, 14, 'intermediate'),

-- Course 6: Digital Products
('11111111-1111-1111-1111-111111111106', 'Why Digital Products Are the Best First Product', 'Zero inventory. Infinite margin. Sell while you sleep.

Best first products:
• Templates & Notion dashboards
• Mini ebooks (20–40 pages)
• Recorded workshops
• Email courses

Ship one in 7 days using the playbook below.', 'reading', 0, 10, 'beginner'),
('11111111-1111-1111-1111-111111111106', 'Pricing Tiers & Bundling', 'Use a 3-tier pricing model:
• Starter — single product
• Pro — product + templates + community
• VIP — everything + 1:1 access

Anchoring increases average order value by 30–60%. Make Tier 2 the obvious winner.', 'reading', 1, 12, 'intermediate'),
('11111111-1111-1111-1111-111111111106', 'Launching on Gumroad, Stan, or Shopify', 'Three options compared:
• Gumroad — fastest, lowest fees, best for first $1k
• Stan Store — link-in-bio + product, ideal for creators
• Shopify — most control, best for scaling past $10k/mo

We will walk through full setup for each.', 'reading', 2, 18, 'intermediate'),

-- Course 7: E-commerce
('11111111-1111-1111-1111-111111111107', 'E-commerce in 2026: What Actually Works', 'Pure dropshipping is dying. What replaces it:
• Branded one-product stores
• Print-on-demand with strong design
• Influencer-led brands
• Subscription boxes

Pick a model that builds an asset, not a flash-in-the-pan store.', 'reading', 0, 12, 'advanced'),
('11111111-1111-1111-1111-111111111107', 'Finding Winning Products', 'Criteria for a winner:
• Solves a visible problem
• Has wow factor on video
• 3–5x markup possible
• Not in every supermarket
• Lightweight + cheap to ship

Tools: Minea, PiPiADS, TikTok Creative Center.', 'reading', 1, 15, 'advanced'),
('11111111-1111-1111-1111-111111111107', 'Building a Shopify Store That Converts', 'Theme: Dawn or Sense.
Apps: Vitals, Loox, Klaviyo, Judge.me.
Sections needed: hero, USP bar, product story, comparison, reviews, FAQ, guarantee.

Speed > pretty. Aim for <3s mobile load.', 'reading', 2, 18, 'advanced'),
('11111111-1111-1111-1111-111111111107', 'TikTok & Meta Ads Bootcamp', 'Start with $20/day test campaigns:
• 3 hooks × 3 angles = 9 creatives
• Kill anything under 1% CTR after $30 spent
• Scale winners 20% per day, not 200%
• Refresh creatives weekly to fight fatigue.', 'reading', 3, 20, 'advanced'),

-- Course 8: Scaling
('11111111-1111-1111-1111-111111111108', 'When and How to Hire Your First VA', 'You are ready when:
• You earn $5k+/month consistently
• You have 5+ repeatable hours weekly
• You have written SOPs

Hire from OnlineJobs.ph or Upwork. Start with 10 hours/week of admin, email, and content scheduling.', 'reading', 0, 12, 'advanced'),
('11111111-1111-1111-1111-111111111108', 'Building SOPs that Run Without You', 'Every recurring task becomes:
• A Loom video walkthrough
• A Notion checklist
• A clear DONE definition

Goal: any new hire executes the task in week one without asking you.', 'reading', 1, 15, 'advanced'),
('11111111-1111-1111-1111-111111111108', 'Automating with AI & No-Code', 'Stack we recommend:
• Zapier / Make for connecting apps
• ChatGPT for content & customer support drafts
• Notion AI for internal docs
• Cal.com + Stripe for bookings

A solo founder in 2026 punches above weight with this stack.', 'reading', 2, 18, 'advanced'),
('11111111-1111-1111-1111-111111111108', 'Designing the Business for Freedom', 'Start with the lifestyle, reverse-engineer the business.

Ask:
• How many hours per week do I want to work?
• What is my minimum monthly profit goal?
• Where do I want to live?
• Who do I want to serve?

Then choose the model and price that gets you there. Most founders skip this and end up trapped.', 'reading', 3, 15, 'advanced');
