import { legacyProfileSource } from "./shared";
import type { Project } from "../types";

export const projects = [
  {
    id: "project.rugpull-detection",
    locale: "en",
    source: {
      ...legacyProfileSource,
      url: "https://github.com/patorsiang/rugpull-detection-msc-kent-2025",
    },
    visibility: "public",
    title: {
      en: "Cryptocurrency Rug Pull Detection",
      translated: { th: { value: "Cryptocurrency Rug Pull Detection", status: "reviewed" } },
    },
    slug: "cryptocurrency-rug-pull-detection",
    category: "ai-ml",
    status: "archived",
    summary: {
      en: "Research prototype that analyzes smart contracts, blockchain activity, and anomaly signals to flag possible DeFi rug-pull risk, reaching 0.94 macro F1 on an 843-contract benchmark.",
      translated: {
        th: {
          value:
            "ต้นแบบงานวิจัยที่วิเคราะห์ smart contracts, blockchain activity และ anomaly signals เพื่อช่วยระบุความเสี่ยงที่อาจเกี่ยวข้องกับ DeFi rug pull ได้ macro F1 0.94 จากการทดสอบบน benchmark 843 contracts",
          status: "ai_draft",
        },
      },
    },
    role: {
      en: "Designer and developer",
      translated: { th: { value: "ผู้ออกแบบและผู้พัฒนา", status: "reviewed" } },
    },
    techStack: ["FastAPI", "Python", "React", "Redis", "TensorFlow", "Docker"],
    tags: [
      "ai",
      "machine-learning",
      // Both are true of this project and were simply missing: TensorFlow is in its
      // own techStack, and its summary calls it a research prototype. Without them it
      // ranked below a coursework classifier on the AI/ML CV.
      "tensorflow",
      "research",
      "python",
      "backend",
      "frontend",
      "web",
      "blockchain",
      "software-engineering",
    ],
    highlights: [
      {
        en: "Trained a fused multi-model classifier (tabular, Solidity source, opcode, and GRU timeline features) on 1,550 labelled contracts, reaching 0.94 macro F1 on an 843-contract benchmark across 6 rug-pull categories.",
        translated: {
          th: {
            value:
              "ฝึก fused multi-model classifier (tabular, Solidity source, opcode และ GRU timeline features) บน contract ที่มี label 1,550 รายการ ได้ macro F1 0.94 จากการทดสอบบน benchmark 843 contracts ครอบคลุม 6 ประเภทพฤติกรรม rug pull",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Built a React/Vite and FastAPI workflow for contract address intake, feature extraction, and prediction review.",
        translated: {
          th: {
            value:
              "พัฒนา workflow ด้วย React/Vite และ FastAPI สำหรับรับ contract address, feature extraction และตรวจดูผล prediction",
            status: "reviewed",
          },
        },
      },
      {
        en: "Used Redis and Docker Compose to coordinate backend services and local experiment runs.",
        translated: {
          th: {
            value: "ใช้ Redis และ Docker Compose เพื่อจัดการ backend services และการทดลองในเครื่อง",
            status: "reviewed",
          },
        },
      },
    ],
    links: [
      {
        label: { en: "GitHub", translated: { th: { value: "GitHub", status: "approved" } } },
        url: "https://github.com/patorsiang/rugpull-detection-msc-kent-2025",
      },
    ],
    placement: "featured-project",
    contributionType: "academic",
    timeframe: { en: "2025" },
    problem: {
      en: "DeFi rug-pull scams can hide risky behavior across smart-contract source code, bytecode, transaction timelines, and anomaly patterns, making manual inspection difficult and time-consuming.",
      translated: {
        th: {
          value:
            "ความเสี่ยงแบบ DeFi rug pull อาจซ่อนอยู่ใน source code, bytecode, transaction timelines และ anomaly patterns ทำให้การตรวจด้วยคนเพียงอย่างเดียวทำได้ยากและใช้เวลา",
          status: "reviewed",
        },
      },
    },
    audience: {
      en: "Academic reviewers, blockchain security learners, and builders exploring ML-assisted contract risk analysis.",
      translated: {
        th: {
          value:
            "ผู้ประเมินงานวิชาการ ผู้เรียนด้าน blockchain security และผู้พัฒนาที่สนใจการวิเคราะห์ความเสี่ยงของ contract ด้วย ML",
          status: "reviewed",
        },
      },
    },
    keyLearning: [
      {
        en: "Heterogeneous blockchain evidence needs a pipeline that can normalize Etherscan/local data into source, opcode, tabular, and timeline features.",
        translated: {
          th: {
            value:
              "ข้อมูลจาก blockchain มีหลายรูปแบบ จึงต้องมี pipeline ที่แปลงข้อมูลจาก Etherscan หรือข้อมูล local ให้เป็น source, opcode, tabular และ timeline features ได้",
            status: "reviewed",
          },
        },
      },
      {
        en: "Prediction fusion is useful when separate ML and anomaly heads capture different risk patterns, but the result depends heavily on dataset provenance and metrics.",
        translated: {
          th: {
            value:
              "การรวมผล prediction ช่วยได้เมื่อโมเดล ML และ anomaly heads จับ risk patterns คนละแบบ แต่ผลลัพธ์ยังขึ้นกับที่มาของ dataset และ metrics อย่างมาก",
            status: "reviewed",
          },
        },
      },
    ],
    testingNotes: {
      en: "Research prototype only; not production security tooling or financial advice. Public release needs stronger dataset provenance, license documentation, and exact model metrics.",
      translated: {
        th: {
          value:
            "เป็นต้นแบบงานวิจัยเท่านั้น ไม่ใช่เครื่องมือความปลอดภัยสำหรับใช้งานจริงหรือคำแนะนำทางการเงิน หากเผยแพร่สู่สาธารณะควรมีหลักฐานที่มาของ dataset, license documentation และ model metrics ที่ชัดเจนกว่านี้",
          status: "reviewed",
        },
      },
    },
  },
  {
    id: "project.smart-shoe",
    locale: "en",
    source: {
      ...legacyProfileSource,
      url: "https://github.com/patorsiang/smart-shoe",
    },
    visibility: "public",
    title: {
      en: "Smart Shoe Prototype",
      translated: { th: { value: "Smart Shoe Prototype", status: "reviewed" } },
    },
    slug: "smart-shoe-prototype",
    category: "iot",
    status: "archived",
    summary: {
      en: "IoT smart shoe prototype that collects force and motion data from an ESP32 device and visualizes live step, balance, and fall-risk signals.",
      translated: {
        th: {
          value:
            "ต้นแบบ smart shoe ด้าน IoT ที่เก็บข้อมูลแรงกดและการเคลื่อนไหวจาก ESP32 แล้วแสดงผลสัญญาณ step, balance และ fall-risk แบบ live",
          status: "reviewed",
        },
      },
    },
    role: { en: "Developer", translated: { th: { value: "ผู้พัฒนา", status: "reviewed" } } },
    techStack: ["C++", "Next.js", "Arduino", "ESP32", "BLE", "MQTT"],
    tags: ["iot", "web", "frontend", "nextjs", "software-engineering"],
    highlights: [
      {
        en: "Collected pressure and motion readings from 3 force sensors (front, middle, heel) and an MPU6050, processed on ESP32 firmware with median filtering.",
        translated: {
          th: {
            value:
              "เก็บข้อมูลแรงกดและการเคลื่อนไหวจาก force sensor 3 จุด (หน้าเท้า, กลางเท้า, ส้นเท้า) และ MPU6050 ประมวลผลบน ESP32 firmware ด้วย median filtering",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Applied threshold and debounce logic to detect steps, falls, and uneven weight balance.",
        translated: {
          th: {
            value:
              "ใช้ threshold และ debounce logic เพื่อตรวจจับ step, การล้ม และความไม่สมดุลของน้ำหนัก",
            status: "ai_draft",
          },
        },
      },
      {
        en: "Published readings through BLE notifications and MQTT into a live Next.js dashboard.",
        translated: {
          th: {
            value:
              "ส่งข้อมูลผ่าน BLE notifications และ MQTT ไปยัง live dashboard ที่ทำด้วย Next.js",
            status: "reviewed",
          },
        },
      },
    ],
    links: [
      {
        label: { en: "GitHub", translated: { th: { value: "GitHub", status: "approved" } } },
        url: "https://github.com/patorsiang/smart-shoe",
      },
    ],
    placement: "featured-project",
    contributionType: "academic",
    timeframe: { en: "2025" },
    problem: {
      en: "Movement, pressure balance, and fall-risk signals are difficult to observe continuously without combining sensors, embedded logic, wireless communication, and interface design.",
      translated: {
        th: {
          value:
            "การติดตาม movement, pressure balance และ fall-risk อย่างต่อเนื่องต้องอาศัยทั้ง sensors, embedded logic, wireless communication และ interface design",
          status: "reviewed",
        },
      },
    },
    audience: {
      en: "Academic evaluators, IoT learners, and product teams exploring wearable sensing prototypes.",
      translated: {
        th: {
          value:
            "ผู้ประเมินงานวิชาการ ผู้เรียนด้าน IoT และทีมผลิตภัณฑ์ที่กำลังสำรวจต้นแบบ wearable sensing",
          status: "reviewed",
        },
      },
    },
    keyLearning: [
      {
        en: "Explainable threshold logic works well for an academic prototype, but it depends on calibration, sensor placement, and noise handling.",
        translated: {
          th: {
            value:
              "threshold logic ที่อธิบายได้เหมาะกับต้นแบบเชิงวิชาการ แต่ยังขึ้นกับ calibration, sensor placement และการจัดการ noise",
            status: "reviewed",
          },
        },
      },
      {
        en: "A useful wearable demo needs the full path from embedded readings to wireless transport, dashboard state, battery status, alerts, force distribution, and motion views.",
        translated: {
          th: {
            value:
              "demo ด้าน wearable ที่ใช้งานได้ต้องเชื่อมครบตั้งแต่ embedded readings, wireless transport, dashboard state, battery status, alerts, force distribution และ motion views",
            status: "reviewed",
          },
        },
      },
    ],
    testingNotes: {
      en: "Academic prototype only; not a medical or safety device. Results are sensitive to sensor placement, calibration, noise, and hardware reliability.",
      translated: {
        th: {
          value:
            "เป็นต้นแบบเชิงวิชาการเท่านั้น ไม่ใช่อุปกรณ์ทางการแพทย์หรืออุปกรณ์ความปลอดภัย ผลลัพธ์ไวต่อ sensor placement, calibration, noise และความเสถียรของ hardware",
          status: "reviewed",
        },
      },
    },
  },
  {
    id: "project.food101-classification",
    locale: "en",
    source: {
      ...legacyProfileSource,
      url: "https://github.com/patorsiang/AI-System---Food-Image-Classification-for-Nutritional-Estimation",
    },
    visibility: "public",
    title: {
      en: "Food-101 Image Classification",
      translated: { th: { value: "Food-101 Image Classification", status: "reviewed" } },
    },
    slug: "food101-image-classification",
    category: "ai-ml",
    status: "archived",
    summary: {
      en: "Computer-vision experiment using Food-101 and EfficientNetV2B2 transfer learning to test food recognition for a future nutrition-estimation pipeline.",
      translated: {
        th: {
          value:
            "งานทดลอง computer vision ที่ใช้ Food-101 และ EfficientNetV2B2 transfer learning เพื่อทดสอบ food recognition สำหรับแนวทาง nutrition-estimation ในอนาคต",
          status: "reviewed",
        },
      },
    },
    role: { en: "Developer", translated: { th: { value: "ผู้พัฒนา", status: "reviewed" } } },
    techStack: ["Python", "TensorFlow", "Transfer Learning"],
    tags: [
      "ai",
      "machine-learning",
      "deep-learning",
      "computer-vision",
      "python",
      "tensorflow",
      "academic",
    ],
    highlights: [
      {
        en: "Trained an EfficientNetV2B2 transfer-learning model on the 101-class Food-101 dataset.",
        translated: {
          th: {
            value:
              "ฝึก EfficientNetV2B2 transfer-learning model บน Food-101 dataset ที่มี 101 classes",
            status: "reviewed",
          },
        },
      },
      {
        en: "Evaluated on 25,250 samples with 0.8493 accuracy and 0.8488 macro F1.",
        translated: {
          th: {
            value: "ประเมินผลบน 25,250 samples ได้ accuracy 0.8493 และ macro F1 0.8488",
            status: "reviewed",
          },
        },
      },
      {
        en: "Mapped the classification task to the first stage of a nutrition-estimation product path.",
        translated: {
          th: {
            value: "วาง classification task เป็นขั้นแรกของแนวทางผลิตภัณฑ์ nutrition-estimation",
            status: "reviewed",
          },
        },
      },
    ],
    links: [
      {
        label: { en: "GitHub", translated: { th: { value: "GitHub", status: "approved" } } },
        url: "https://github.com/patorsiang/AI-System---Food-Image-Classification-for-Nutritional-Estimation",
      },
    ],
    placement: "project",
    contributionType: "academic",
    timeframe: { en: "2025" },
    problem: {
      en: "Food recognition is a first step toward nutrition estimation, but calories and nutrients require reliable classification plus future portion-size and nutrition database work.",
      translated: {
        th: {
          value:
            "food recognition เป็นขั้นแรกของ nutrition estimation แต่การประเมิน calories และ nutrients ยังต้องมี classification ที่น่าเชื่อถือ รวมถึงงานต่อยอดเรื่อง portion size และ nutrition database",
          status: "reviewed",
        },
      },
    },
    audience: {
      en: "Academic reviewers and ML/product teams evaluating the feasibility of food-image recognition for nutrition tools.",
      translated: {
        th: {
          value:
            "ผู้ประเมินงานวิชาการ และทีม ML/product ที่ต้องการประเมินความเป็นไปได้ของ food-image recognition สำหรับ nutrition tools",
          status: "reviewed",
        },
      },
    },
    keyLearning: [
      {
        en: "Transfer learning can produce strong Food-101 classification results without training a large vision model from scratch.",
        translated: {
          th: {
            value:
              "transfer learning สามารถให้ผล classification บน Food-101 ได้ดี โดยไม่ต้องฝึก vision model ขนาดใหญ่ตั้งแต่ต้น",
            status: "reviewed",
          },
        },
      },
      {
        en: "The model is a solid ML experiment, but product readiness depends on portion-size estimation, nutrition database integration, and an app or API layer.",
        translated: {
          th: {
            value:
              "โมเดลนี้เป็นงานทดลอง ML ที่มีผลลัพธ์ชัดเจน แต่ความพร้อมด้านผลิตภัณฑ์ยังขึ้นกับ portion-size estimation, nutrition database integration และ app/API layer",
            status: "reviewed",
          },
        },
      },
    ],
    testingNotes: {
      en: "Evaluated on 25,250 Food-101 samples with 0.8493 accuracy and 0.8488 macro F1; nutrition database integration, portion-size estimation, and app/API delivery are not complete.",
      translated: {
        th: {
          value:
            "ประเมินผลบน Food-101 จำนวน 25,250 samples ได้ accuracy 0.8493 และ macro F1 0.8488; ยังไม่ได้ทำ nutrition database integration, portion-size estimation และ app/API delivery ให้สมบูรณ์",
          status: "reviewed",
        },
      },
    },
  },
  {
    id: "project.vending-machine-simulator",
    locale: "en",
    source: {
      ...legacyProfileSource,
      url: "https://github.com/patorsiang/Java-Assignment-Vending-Machine",
    },
    visibility: "public",
    title: {
      en: "Vending Machine Simulator",
      translated: { th: { value: "Vending Machine Simulator", status: "reviewed" } },
    },
    slug: "vending-machine-simulator",
    category: "academic",
    status: "archived",
    summary: {
      en: "Java OOP simulator for transactions and inventory management.",
      translated: {
        th: {
          value: "Java OOP simulator สำหรับฝึก transaction และ inventory management",
          status: "reviewed",
        },
      },
    },
    role: { en: "Developer", translated: { th: { value: "ผู้พัฒนา", status: "reviewed" } } },
    techStack: ["Java", "OOP"],
    tags: ["software-engineering", "java", "oop", "academic"],
    highlights: [
      {
        en: "Modelled transaction and inventory flows with object-oriented design.",
        translated: {
          th: {
            value: "ออกแบบ transaction และ inventory flows ด้วยแนวคิด object-oriented design",
            status: "reviewed",
          },
        },
      },
      {
        en: "Practised applying design patterns in a small Java system.",
        translated: {
          th: {
            value: "ฝึกใช้ design patterns ในระบบ Java ขนาดเล็ก",
            status: "reviewed",
          },
        },
      },
    ],
    links: [
      {
        label: { en: "GitHub", translated: { th: { value: "GitHub", status: "approved" } } },
        url: "https://github.com/patorsiang/Java-Assignment-Vending-Machine",
      },
    ],
    placement: "playground",
    contributionType: "academic",
    timeframe: { en: "2025" },
  },
  {
    id: "project.rsa-cryptosystem",
    locale: "en",
    source: {
      ...legacyProfileSource,
      url: "https://github.com/patorsiang/ComSec-RSA-Assignment",
    },
    visibility: "public",
    title: {
      en: "RSA Cryptosystem",
      translated: { th: { value: "RSA Cryptosystem", status: "reviewed" } },
    },
    slug: "rsa-cryptosystem",
    category: "security-ctf",
    status: "archived",
    summary: {
      en: "Python implementation of RSA encryption and decryption for cryptography fundamentals.",
      translated: {
        th: {
          value:
            "การ implement RSA encryption และ decryption ด้วย Python เพื่อฝึกพื้นฐาน cryptography",
          status: "reviewed",
        },
      },
    },
    role: { en: "Developer", translated: { th: { value: "ผู้พัฒนา", status: "reviewed" } } },
    techStack: ["Python", "RSA", "Cryptography"],
    tags: ["security", "cryptography", "python", "academic"],
    highlights: [
      {
        en: "Implemented RSA encryption and decryption in Python.",
        translated: {
          th: { value: "เขียน RSA encryption และ decryption ด้วย Python", status: "reviewed" },
        },
      },
      {
        en: "Practised core cryptography concepts through a focused assignment.",
        translated: {
          th: {
            value: "ฝึกแนวคิดพื้นฐานด้าน cryptography ผ่าน assignment ขนาดเล็ก",
            status: "reviewed",
          },
        },
      },
    ],
    links: [
      {
        label: { en: "GitHub", translated: { th: { value: "GitHub", status: "approved" } } },
        url: "https://github.com/patorsiang/ComSec-RSA-Assignment",
      },
    ],
    placement: "playground",
    contributionType: "academic",
    timeframe: { en: "2025" },
  },
  {
    id: "project.chi-cultural-heritage-pwa",
    locale: "en",
    source: {
      ...legacyProfileSource,
      url: "https://github.com/patorsiang/chi",
    },
    visibility: "public",
    title: {
      en: "CHI Cultural Heritage PWA",
      translated: { th: { value: "CHI Cultural Heritage PWA", status: "reviewed" } },
    },
    slug: "chi-cultural-heritage-pwa",
    category: "web",
    status: "archived",
    summary: {
      en: "Progressive web app for cultural knowledge exchange about Indian heritage.",
      translated: {
        th: {
          value: "Progressive web app สำหรับแลกเปลี่ยนความรู้ด้านมรดกวัฒนธรรมอินเดีย",
          status: "reviewed",
        },
      },
    },
    role: { en: "Developer", translated: { th: { value: "ผู้พัฒนา", status: "reviewed" } } },
    techStack: ["PWA", "JavaScript", "Node.js", "MongoDB"],
    tags: [
      "web",
      "frontend",
      "backend",
      "javascript",
      "nodejs",
      "database",
      "software-engineering",
    ],
    highlights: [
      {
        en: "Built offline-capable web and mobile experiences.",
        translated: {
          th: {
            value: "พัฒนา web และ mobile experience ที่รองรับการใช้งาน offline",
            status: "reviewed",
          },
        },
      },
      {
        en: "Collaborated across Mahidol University's ICT faculty and the Institute for Languages and Cultures of Asia.",
        translated: {
          th: {
            value:
              "ทำงานร่วมกันระหว่างคณะ ICT มหาวิทยาลัยมหิดล และสถาบันวิจัยภาษาและวัฒนธรรมเอเชีย",
            status: "reviewed",
          },
        },
      },
    ],
    links: [
      {
        label: { en: "GitHub", translated: { th: { value: "GitHub", status: "approved" } } },
        url: "https://github.com/patorsiang/chi",
      },
    ],
    placement: "project",
    contributionType: "academic",
    timeframe: { en: "2019" },
  },
] as const satisfies readonly Project[];
