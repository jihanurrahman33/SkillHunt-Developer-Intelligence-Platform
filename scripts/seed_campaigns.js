const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('skillhunt');
    
    // 1. Get an admin user
    const admin = await db.collection('users').findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found to associate campaigns with.');
      process.exit(1);
    }

    const userId = admin._id.toString();
    const userName = admin.name;

    const campaigns = [
      {
        title: 'Senior Frontend Architect',
        role: 'Frontend Engineer',
        description: 'Building the next generation of our design system.',
        status: 'active',
        salary: '$160k - $210k',
        location: 'Remote (US/EU)',
        priority: 'high',
        techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
      },
      {
        title: 'Backend Systems Engineer (Rust)',
        role: 'Backend Engineer',
        description: 'Optimizing high-throughput data pipelines for our core engine.',
        status: 'active',
        salary: '$170k - $230k',
        location: 'Amsterdam, NL',
        priority: 'high',
        techStack: ['Rust', 'Tokio', 'PostgreSQL', 'Redis'],
      },
      {
        title: 'Full Stack Product Engineer',
        role: 'Full Stack Engineer',
        description: 'End-to-end ownership of our new collaboration features.',
        status: 'active',
        salary: '$140k - $190k',
        location: 'Remote (Global)',
        priority: 'medium',
        techStack: ['Node.js', 'React', 'TypeScript', 'MongoDB'],
      },
      {
        title: 'DevOps & Scalability Specialist',
        role: 'Site Reliability Engineer',
        description: 'Managing our Kubernetes clusters and multi-cloud infra.',
        status: 'active',
        salary: '$150k - $200k',
        location: 'Berlin, DE',
        priority: 'medium',
        techStack: ['Kubernetes', 'AWS', 'Terraform', 'Go'],
      },
      {
        title: 'Mobile App Lead (React Native)',
        role: 'Mobile Engineer',
        description: 'Leading the technical roadmap for our iOS/Android apps.',
        status: 'active',
        salary: '$160k - $210k',
        location: 'London, UK',
        priority: 'high',
        techStack: ['React Native', 'TypeScript', 'Redux', 'Native modules'],
      },
      {
        title: 'AI/ML Platform Engineer',
        role: 'ML Engineer',
        description: 'Integrating LLMs into our production workflows.',
        status: 'active',
        salary: '$180k - $250k',
        location: 'San Francisco, CA',
        priority: 'high',
        techStack: ['Python', 'PyTorch', 'FastAPI', 'Vector DBs'],
      },
      {
        title: 'Security Engineer',
        role: 'Security Specialist',
        description: 'Ensuring the integrity of our zero-trust architecture.',
        status: 'draft',
        salary: '$155k - $195k',
        location: 'Remote',
        priority: 'high',
        techStack: ['Cloud Security', 'IAM', 'Network Security', 'Pentesting'],
      },
      {
        title: 'QA Automation Lead',
        role: 'QA Engineer',
        description: 'Architecting our global testing strategy and pipelines.',
        status: 'active',
        salary: '$130k - $170k',
        location: 'Remote (EU)',
        priority: 'medium',
        techStack: ['Playwright', 'Cypress', 'GitHub Actions', 'JavaScript'],
      },
      {
        title: 'Data Engineer (Big Data)',
        role: 'Data Engineer',
        description: 'Handling petabyte-scale data ingestion and processing.',
        status: 'active',
        salary: '$165k - $215k',
        location: 'New York, NY',
        priority: 'medium',
        techStack: ['Spark', 'Scala', 'Snowflake', 'Airflow'],
      },
      {
        title: 'UI/UX Interactive Designer',
        role: 'Product Designer',
        description: 'Crafting premium interactive experiences for our platform.',
        status: 'active',
        salary: '$120k - $160k',
        location: 'Remote',
        priority: 'medium',
        techStack: ['Figma', 'Framer Motion', 'Interaction Design'],
      },
      {
        title: 'Internal Tools Engineer',
        role: 'Full Stack Engineer',
        description: 'Empowering our team with custom productivity software.',
        status: 'closed',
        salary: '$140k - $180k',
        location: 'Remote',
        priority: 'low',
        techStack: ['React', 'Express', 'Prisma', 'PostgreSQL'],
      },
      {
        title: 'Growth Engineering Lead',
        role: 'Frontend Engineer',
        description: 'Optimizing conversion funnels through rapid experimentation.',
        status: 'active',
        salary: '$160k - $200k',
        location: 'Remote',
        priority: 'medium',
        techStack: ['Next.js', 'VWO', 'Segment', 'Analytics'],
      },
      {
        title: 'Blockchain/Solidity Engineer',
        role: 'Web3 Engineer',
        description: 'Developing secure smart contracts for our payment layer.',
        status: 'active',
        salary: '$180k - $260k',
        location: 'Lisbon, PT',
        priority: 'high',
        techStack: ['Solidity', 'Ethers.js', 'Hardhat', 'L2s'],
      },
      {
        title: 'Embedded Systems Specialist',
        role: 'Hardware Engineer',
        description: 'Working on our latest hardware integration modules.',
        status: 'draft',
        salary: '$150k - $190k',
        location: 'Austin, TX',
        priority: 'medium',
        techStack: ['C++', 'RTOS', 'Rust', 'I2C/SPI'],
      },
      {
        title: 'Technical Writer (API Specialist)',
        role: 'Developer Relations',
        description: 'Making our docs as powerful as our software.',
        status: 'active',
        salary: '$110k - $150k',
        location: 'Remote',
        priority: 'low',
        techStack: ['Markdown', 'GraphQL', 'OpenAPI', 'Technical Writing'],
      },
      {
        title: 'Cloud Infrastructure Architect',
        role: 'Cloud Engineer',
        description: 'Designing resilient multi-region cloud architectures.',
        status: 'active',
        salary: '$175k - $240k',
        location: 'Seattle, WA',
        priority: 'high',
        techStack: ['Azure', 'GCP', 'Terraform', 'Istio'],
      },
      {
        title: 'React Performance Expert',
        role: 'Frontend Engineer',
        description: 'Taming complex state and rendering in our data-heavy dashboards.',
        status: 'active',
        salary: '$160k - $200k',
        location: 'Remote',
        priority: 'high',
        techStack: ['React', 'Performance Profiling', 'Web Workers'],
      },
      {
        title: 'Senior Ruby on Rails Developer',
        role: 'Backend Engineer',
        description: 'Scaling our legacy core while transitioning to microservices.',
        status: 'active',
        salary: '$150k - $190k',
        location: 'Remote (US)',
        priority: 'medium',
        techStack: ['Ruby', 'Rails', 'Sidekiq', 'PostgreSQL'],
      },
      {
        title: 'Search/Elasticsearch Engineer',
        role: 'Search Specialist',
        description: 'Perfecting our global search and ranking algorithms.',
        status: 'active',
        salary: '$160k - $210k',
        location: 'Remote',
        priority: 'medium',
        techStack: ['Elasticsearch', 'Lucene', 'Go', 'Python'],
      },
      {
        title: 'DevOps Security (DevSecOps)',
        role: 'SRE',
        description: 'Automating security into every stage of the CI/CD pipeline.',
        status: 'active',
        salary: '$160k - $210k',
        location: 'Remote',
        priority: 'high',
        techStack: ['Jenkins', 'Snyk', 'Vault', 'Kubernetes'],
      },
    ];

    const seededCampaigns = campaigns.map(c => ({
      ...c,
      createdBy: {
        id: userId,
        name: userName,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await db.collection('campaigns').insertMany(seededCampaigns);
    console.log(`Successfully seeded ${result.insertedCount} campaigns!`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await client.close();
  }
}

seed();
