export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  uploadDate: string;
  pdfUrl: string;
  topics: string[];
  methodology: string;
  keyFindings: string[];
  citations: number;
  year: number;
}

export interface ChatMessage {
  id: string;
  articleId: string;
  question: string;
  answer: string;
  timestamp: string;
  sources?: string[];
}

export interface AnalysisSession {
  id: string;
  name: string;
  articleIds: string[];
  createdDate: string;
  type: 'summary' | 'comparison' | 'chat';
  duration?: number;
}

export interface SavedAnalysis {
  id: string;
  name: string;
  articleId: string;
  articleTitle: string;
  analysisType: 'analyze' | 'compare';
  prompt: string;
  result: string;
  comparison?: string;
  questionsFromPrompt?: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'lecturer' | 'student';
  researchedArticleIds?: string[];
}

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Dr. Sarah Johnson',
    email: 'lecturer@university.edu',
    role: 'lecturer'
  },
  {
    id: 'u2',
    name: 'Alex Student',
    email: 'student@university.edu',
    role: 'student',
    researchedArticleIds: ['1', '4']
  },
  {
    id: 'u3',
    name: 'Maria Garcia',
    email: 'maria@university.edu',
    role: 'student',
    researchedArticleIds: ['2', '3', '5']
  }
];

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Deep Learning Approaches for Natural Language Processing: A Comprehensive Survey',
    authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Emily Rodriguez'],
    abstract: 'This paper presents a comprehensive survey of deep learning techniques applied to natural language processing tasks. We examine recent advances in transformer architectures, pre-trained language models, and their applications across various NLP domains including machine translation, sentiment analysis, and question answering.',
    uploadDate: '2026-04-15',
    pdfUrl: '#',
    topics: ['Deep Learning', 'NLP', 'Transformers', 'Language Models'],
    methodology: 'Literature Review and Comparative Analysis',
    keyFindings: [
      'Transformer models outperform traditional RNNs by 23% on average',
      'Pre-training on large corpora significantly improves downstream task performance',
      'Attention mechanisms enable better context understanding',
      'Model size correlates with performance up to a saturation point'
    ],
    citations: 342,
    year: 2025
  },
  {
    id: '2',
    title: 'Quantum Computing Applications in Cryptography: Challenges and Opportunities',
    authors: ['Prof. David Zhang', 'Dr. Lisa Anderson'],
    abstract: 'We explore the intersection of quantum computing and modern cryptography, analyzing both the threats posed by quantum algorithms to current encryption methods and the opportunities for quantum-resistant cryptographic protocols.',
    uploadDate: '2026-04-10',
    pdfUrl: '#',
    topics: ['Quantum Computing', 'Cryptography', 'Security', 'Post-Quantum'],
    methodology: 'Experimental Study with Simulations',
    keyFindings: [
      'Shor\'s algorithm poses significant threat to RSA encryption',
      'Lattice-based cryptography shows promise for quantum resistance',
      'Current quantum computers still limited by coherence time',
      'Hybrid classical-quantum approaches offer near-term solutions'
    ],
    citations: 187,
    year: 2025
  },
  {
    id: '3',
    title: 'Climate Change Impact on Marine Biodiversity: A Meta-Analysis',
    authors: ['Dr. Emma Thompson', 'Prof. James Wilson', 'Dr. Maria Garcia', 'Dr. Ahmed Hassan'],
    abstract: 'This meta-analysis examines 150 studies on climate change effects on marine ecosystems. We quantify biodiversity loss, species migration patterns, and ecosystem resilience across different oceanic regions.',
    uploadDate: '2026-03-28',
    pdfUrl: '#',
    topics: ['Climate Change', 'Marine Biology', 'Biodiversity', 'Ecology'],
    methodology: 'Meta-Analysis of 150 Studies',
    keyFindings: [
      'Average 15% decline in marine biodiversity over past decade',
      'Coral reef ecosystems most severely affected',
      'Poleward migration of fish species accelerating',
      'Ocean acidification compounds temperature effects'
    ],
    citations: 521,
    year: 2024
  },
  {
    id: '4',
    title: 'Machine Learning for Medical Diagnosis: A Clinical Trial Study',
    authors: ['Dr. Robert Kim', 'Dr. Patricia Martinez'],
    abstract: 'We present results from a multi-center clinical trial evaluating machine learning algorithms for early disease detection. The study includes data from 50,000 patients across 20 medical centers.',
    uploadDate: '2026-04-01',
    pdfUrl: '#',
    topics: ['Machine Learning', 'Healthcare', 'Medical Diagnosis', 'AI'],
    methodology: 'Multi-Center Clinical Trial (n=50,000)',
    keyFindings: [
      '94% accuracy in early cancer detection',
      'Reduced false positive rate by 31% compared to traditional methods',
      'Average diagnosis time reduced from 3 weeks to 48 hours',
      'Cost reduction of 42% per patient screening'
    ],
    citations: 289,
    year: 2025
  },
  {
    id: '5',
    title: 'Renewable Energy Integration in Smart Grids: Optimization Strategies',
    authors: ['Prof. Anna Kowalski', 'Dr. Thomas Brown', 'Dr. Yuki Tanaka'],
    abstract: 'This paper investigates optimization strategies for integrating renewable energy sources into existing power grids. We propose novel algorithms for load balancing and energy storage management.',
    uploadDate: '2026-03-20',
    pdfUrl: '#',
    topics: ['Renewable Energy', 'Smart Grids', 'Optimization', 'Sustainability'],
    methodology: 'Simulation and Field Testing',
    keyFindings: [
      'Dynamic load balancing improves grid stability by 37%',
      'Optimal battery storage reduces energy waste by 28%',
      'Peak demand can be reduced through predictive algorithms',
      'Integration costs decrease with grid modernization'
    ],
    citations: 156,
    year: 2025
  }
];

export const mockChatHistory: ChatMessage[] = [
  {
    id: 'c1',
    articleId: '1',
    question: 'What are the main advantages of transformer models over RNNs?',
    answer: 'Based on the paper, transformer models offer several key advantages over RNNs: 1) Parallel processing capabilities allowing faster training, 2) Better handling of long-range dependencies through self-attention mechanisms, 3) Superior performance with an average improvement of 23%, and 4) More efficient capture of contextual information across the entire input sequence.',
    timestamp: '2026-04-16T10:30:00',
    sources: ['Section 3.2: Model Architectures', 'Table 2: Performance Comparison']
  },
  {
    id: 'c2',
    articleId: '1',
    question: 'How does pre-training improve model performance?',
    answer: 'The paper demonstrates that pre-training on large corpora provides models with general language understanding that transfers effectively to specific downstream tasks. This approach reduces the amount of task-specific training data needed and improves performance across various NLP applications by 15-40% depending on the task complexity.',
    timestamp: '2026-04-16T10:35:00',
    sources: ['Section 4.1: Pre-training Strategies', 'Figure 5: Performance Gains']
  },
  {
    id: 'c3',
    articleId: '2',
    question: 'What threats does quantum computing pose to current encryption?',
    answer: 'The paper identifies Shor\'s algorithm as the primary threat to current public-key cryptography systems like RSA. When quantum computers reach sufficient scale and coherence time, they will be able to factor large numbers exponentially faster than classical computers, effectively breaking RSA encryption. The authors estimate this could occur within 10-15 years.',
    timestamp: '2026-04-11T14:20:00',
    sources: ['Section 2: Quantum Threats to Cryptography', 'Table 1: Algorithm Comparison']
  }
];

export const mockAnalysisSessions: AnalysisSession[] = [
  {
    id: 's1',
    name: 'AI & Machine Learning Research Review',
    articleIds: ['1', '4'],
    createdDate: '2026-04-16',
    type: 'comparison',
    duration: 25
  },
  {
    id: 's2',
    name: 'Quantum Computing Deep Dive',
    articleIds: ['2'],
    createdDate: '2026-04-11',
    type: 'chat',
    duration: 18
  },
  {
    id: 's3',
    name: 'Climate & Renewable Energy Synthesis',
    articleIds: ['3', '5'],
    createdDate: '2026-04-05',
    type: 'comparison',
    duration: 32
  }
];

export const mockSavedAnalyses: SavedAnalysis[] = [
  {
    id: 'a1',
    name: 'Deep Learning NLP Analysis',
    articleId: '1',
    articleTitle: 'Deep Learning Approaches for Natural Language Processing: A Comprehensive Survey',
    analysisType: 'analyze',
    prompt: 'Analyze the main findings and methodology of this paper, focusing on transformer models and their applications.',
    result: '## Analysis Summary\n\nThis paper provides a comprehensive survey of deep learning techniques in NLP. Key findings include:\n\n### Methodology\n- Literature review and comparative analysis of recent advances\n- Focus on transformer architectures and pre-trained language models\n- Examination of applications across machine translation, sentiment analysis, and question answering\n\n### Key Findings\n- Transformer models outperform traditional RNNs by 23% on average\n- Pre-training on large corpora significantly improves downstream task performance\n- Attention mechanisms enable better context understanding\n- Model size correlates with performance up to a saturation point\n\n### Applications\n- Machine translation: State-of-the-art results achieved\n- Sentiment analysis: Improved accuracy with contextual understanding\n- Question answering: Better performance with attention mechanisms\n\nThe research demonstrates significant advancements in NLP through deep learning approaches.',
    comparison: 'Compared to previous work in RNN-based models, this paper shows substantial improvements in performance metrics across all evaluated tasks.',
    questionsFromPrompt: [
      'What are the main transformer architectures discussed?',
      'How does pre-training improve performance?',
      'What are the key applications of these models?'
    ],
    createdAt: '2026-04-16T10:30:00'
  },
  {
    id: 'a2',
    name: 'Quantum Computing Security Analysis',
    articleId: '2',
    articleTitle: 'Quantum Computing Applications in Cryptography: Challenges and Opportunities',
    analysisType: 'analyze',
    prompt: 'Explain the security implications of quantum computing on current encryption methods and discuss quantum-resistant solutions.',
    result: '## Security Implications Analysis\n\n### Current Encryption Threats\n\nThis paper identifies significant threats posed by quantum computing to modern cryptography:\n\n### Shor\'s Algorithm Impact\n- **RSA Encryption**: Primary target of Shor\'s algorithm\n- **Timeline**: Estimated threat within 10-15 years\n- **Scale**: Exponential speedup in factoring large numbers\n\n### Quantum-Resistant Solutions\n\n### Lattice-Based Cryptography\n- Shows strong promise for quantum resistance\n- Current research focuses on optimization and implementation\n- Considered one of the most viable alternatives\n\n### Hybrid Approaches\n- **Near-term solutions**: Classical-quantum hybrid systems\n- **Practicality**: More implementable in current infrastructure\n- **Transition**: Provides migration path to full quantum solutions\n\n### Current Limitations\n- Quantum computers limited by coherence time\n- Scale insufficient to break current encryption\n- Ongoing research in error correction and scaling\n\nThe paper provides a comprehensive analysis of both threats and solutions in the quantum computing landscape.',
    comparison: 'Compared to traditional cryptographic threats, quantum computing represents a paradigm shift requiring fundamental changes in security protocols.',
    questionsFromPrompt: [
      'What is the timeline for quantum threats?',
      'Which quantum-resistant methods are most promising?',
      'What are current limitations of quantum computers?'
    ],
    createdAt: '2026-04-11T14:20:00'
  }
];
