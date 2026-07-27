import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://neetband.com';

const DEFAULT_IMAGE = `${BASE_URL}/icons/icon-512x512.png`;

const SITE_CONFIG = {
  siteName: 'NeetBand',
  defaultTitle: 'NeetBand — Study Smarter. Remember More.',
  defaultDescription: 'Auditory learning platform for NEET aspirants. Master Class 11 & 12 Biology, Chemistry & Physics through music-based memory techniques. Study anywhere, reduce eye strain.',
};

const ROUTE_META = {
  '/': {
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    public: true,
  },
  '/course': {
    title: 'NEET Syllabus & Music Course Library | NeetBand',
    description: 'Explore song-based modules for NEET Class 11 & 12 Biology, Chemistry, and Physics. Audio memory tracks engineered for high retention.',
    public: true,
  },
  '/library': {
    title: 'Full Audio Syllabus Library | NeetBand',
    description: 'Browse complete auditory tracks and memory songs for NEET preparation across all subjects.',
    public: true,
  },
  '/favourites': {
    title: 'Saved Tracks & Study Playlist | NeetBand',
    description: 'Your personalized collection of NEET audio tracks and revision songs.',
    public: true,
  },
  '/hub': {
    title: 'Student Learning Hub | NeetBand',
    description: 'Interactive audio study tools, summaries, and revision guides for NEET aspirants.',
    public: true,
  },
  '/blog': {
    title: 'NEET Exam Tips & Audio Study Blog | NeetBand',
    description: 'Expert strategies, memory mnemonics, and auditory study techniques for NEET aspirants.',
    public: true,
  },
  '/about': {
    title: 'About NeetBand — Audio Learning Mission | NeetBand',
    description: 'NeetBand replaces tedious screen reading with science-backed auditory learning for NEET Biology, Chemistry & Physics.',
    public: true,
  },
  '/contact': {
    title: 'Contact & Student Support | NeetBand',
    description: 'Get in touch with the NeetBand team for inquiries, support, and study assistance.',
    public: true,
  },
  '/terms': {
    title: 'Terms & Conditions | NeetBand',
    description: 'Terms of service and platform usage terms for NeetBand educational services.',
    public: true,
  },
  '/privacy': {
    title: 'Privacy Policy & Data Security | NeetBand',
    description: 'How NeetBand protects student data, privacy, and account security.',
    public: true,
  },
  '/refund': {
    title: 'Refund Policy | NeetBand',
    description: 'Cancellation and refund policies for NeetBand subscriptions.',
    public: true,
  },
  '/login': {
    title: 'Student Login & Sign Up | NeetBand',
    description: 'Log in or sign up to access NEET audio courses and interactive study sessions.',
    public: true,
  },
  '/dashboard': {
    title: 'Student Dashboard | NeetBand',
    description: 'Manage your NEET study progress, active courses, and audio playlists.',
    public: false,
  },
  '/checkout': {
    title: 'Premium Upgrade & Checkout | NeetBand',
    description: 'Unlock unlimited NEET audio courses, summaries, and offline listening.',
    public: false,
  },
  '/feed': {
    title: 'Community Forum & Feed | NeetBand',
    description: 'Connect with fellow NEET aspirants, share notes, and ask questions.',
    public: false,
  },
};

export function useSeoHead() {
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    // 1. Matched Meta
    let meta = ROUTE_META[path];
    if (!meta) {
      if (path.startsWith('/course/')) {
        meta = {
          title: 'NEET Audio Course Module | NeetBand',
          description: 'Listen to song-based mnemonics and audio summaries for NEET exam preparation.',
          public: true,
        };
      } else if (path.startsWith('/blog/')) {
        meta = {
          title: 'NEET Audio Study Guide | NeetBand Blog',
          description: 'Read and listen to NEET preparation guides, mnemonics, and strategy breakdown.',
          public: true,
        };
      } else {
        meta = {
          title: SITE_CONFIG.defaultTitle,
          description: SITE_CONFIG.defaultDescription,
          public: !path.startsWith('/lms') && !path.startsWith('/offers') && !path.startsWith('/checkout'),
        };
      }
    }

    // 2. Set Document Title
    document.title = meta.title;

    // 3. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', meta.description);

    // 4. Canonical URL
    const canonicalUrl = `${BASE_URL}${path}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 5. Robots tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', meta.public ? 'index, follow' : 'noindex, nofollow');

    // 6. OpenGraph Metadata Helper
    const setOgMeta = (property, content) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', content);
    };

    setOgMeta('og:type', 'website');
    setOgMeta('og:url', canonicalUrl);
    setOgMeta('og:title', meta.title);
    setOgMeta('og:description', meta.description);
    setOgMeta('og:image', DEFAULT_IMAGE);
    setOgMeta('og:site_name', SITE_CONFIG.siteName);

    // 7. Twitter Card Metadata Helper
    const setTwitterMeta = (name, content) => {
      let twTag = document.querySelector(`meta[name="${name}"]`);
      if (!twTag) {
        twTag = document.createElement('meta');
        twTag.setAttribute('name', name);
        document.head.appendChild(twTag);
      }
      twTag.setAttribute('content', content);
    };

    setTwitterMeta('twitter:card', 'summary_large_image');
    setTwitterMeta('twitter:title', meta.title);
    setTwitterMeta('twitter:description', meta.description);
    setTwitterMeta('twitter:image', DEFAULT_IMAGE);

    // 8. Dynamic JSON-LD Structured Data Schema (SEO + GEO + AEO)
    let jsonLdScript = document.getElementById('json-ld-schema');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'json-ld-schema';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }

    const schemas = [
      {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        'name': 'NeetBand',
        'url': BASE_URL,
        'logo': `${BASE_URL}/favicon.png`,
        'description': SITE_CONFIG.defaultDescription,
        'sameAs': [],
        'educationalCredentialAwarded': 'NEET Preparation Audio Certification',
        'audience': {
          '@type': 'Audience',
          'audienceType': 'NEET Aspirants, Class 11 and Class 12 Biology/Chemistry/Physics Students',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'NeetBand',
        'url': BASE_URL,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${BASE_URL}/course?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ];

    // Home Page specific FAQ Schema for AEO
    if (path === '/') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is NeetBand?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'NeetBand is an auditory learning platform designed for NEET aspirants to learn Class 11 & 12 Biology, Chemistry, and Physics through educational songs, summaries, and memory mnemonics.'
            }
          },
          {
            '@type': 'Question',
            'name': 'How does audio learning help in NEET exam preparation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Audio learning leverages musical memory retention, enabling students to revise complex formulas, biological pathways, and chemical reactions hands-free while reducing eye strain.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Can I listen to NeetBand courses offline?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! NeetBand is a Progressive Web App (PWA) allowing aspirants to download audio tracks and revise anytime, even offline.'
            }
          }
        ]
      });

      // Speakable Schema for Auditory Content
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': meta.title,
        'speakable': {
          '@type': 'SpeakableSpecification',
          'cssSelector': ['h1', '.hero-subtitle', '.faq-question']
        }
      });
    }

    // Course Page specific Schema for GEO & SEO
    if (path === '/course' || path === '/library') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Course',
        'name': 'NEET Auditory Learning Masterclass',
        'description': 'Comprehensive NEET Class 11 and 12 Biology, Chemistry, and Physics audio courses.',
        'provider': {
          '@type': 'Organization',
          'name': 'NeetBand',
          'sameAs': BASE_URL
        },
        'educationalLevel': 'High School / NEET Exam Level',
        'hasCourseInstance': {
          '@type': 'CourseInstance',
          'courseMode': 'Online Auditory Learning'
        }
      });

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': BASE_URL
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Courses',
            'item': `${BASE_URL}/course`
          }
        ]
      });
    }

    jsonLdScript.textContent = JSON.stringify(schemas);

  }, [path]);
}

export default useSeoHead;
