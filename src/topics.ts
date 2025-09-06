// Topic whitelist and keyword map used for simple relevance scoring.

export const TOPIC_WHITELIST = [
  // Core AI/ML
  "Generative AI & LLMs",
  "AI Agents & Orchestration",
  "RAG & Vector Databases",
  "MLOps & Model Governance",
  "AI in Security / SecOps",
  "AI for Developer Productivity",
  "Edge AI, IoT & On-Device AI",

  // Data & Cloud
  "Data Engineering (Spark, Iceberg, Delta Lake, Kafka)",
  "Modern Data Warehousing (Snowflake, BigQuery, Databricks)",
  "Streaming & Event-Driven Architectures",
  "Cloud (AWS, Azure, GCP) Enterprise Announcements",

  // Enterprise Platforms
  "ERP & Enterprise Platforms (Oracle, SAP, Workday, ServiceNow, Salesforce)",
  "E-Business Suite, Fusion & ERP Modernization",
  "Retail & E-commerce AI Platforms",

  // QA & Testing
  "Software Testing & Automation",
  "AI in Test Automation (Playwright, Cypress, Selenium, etc.)",
  "RPA (UiPath, Automation Anywhere, BluePrism)",
  "Continuous Testing in CI/CD",

  // Industry-Specific
  "Retail/E-commerce AI Trends",
  "Supply Chain & Logistics Tech",
  "FinTech & Banking IT Innovations"
];

export const KEYWORDS: Record<string, string[]> = {
  "Generative AI & LLMs": ["generative ai", "gpt", "llm", "chatgpt", "claude", "mistral", "llama"],
  "AI Agents & Orchestration": ["ai agent", "orchestration", "autonomous agent", "crew.ai", "langgraph", "autogen", "swarm"],
  "RAG & Vector Databases": ["rag", "retrieval", "vector", "pgvector", "pinecone", "weaviate", "chroma", "milvus"],
  "MLOps & Model Governance": ["mlops", "governance", "model registry", "mlflow", "kubeflow", "feature store"],
  "AI in Security / SecOps": ["ai for security", "secops", "threat detection", "siem", "soar", "xdr"],
  "AI for Developer Productivity": ["ai coding", "copilot", "codegen", "ai pair programmer", "code search"],
  "Edge AI, IoT & On-Device AI": ["edge ai", "on-device", "tinyml", "iot ai", "mobile ai"],

  "Data Engineering (Spark, Iceberg, Delta Lake, Kafka)": ["spark", "iceberg", "delta lake", "kafka", "data lakehouse", "dlt"],
  "Modern Data Warehousing (Snowflake, BigQuery, Databricks)": ["snowflake", "bigquery", "databricks", "redshift", "warehouse"],
  "Streaming & Event-Driven Architectures": ["event-driven", "pubsub", "eventhub", "kinesis", "streaming"],

  "Cloud (AWS, Azure, GCP) Enterprise Announcements": ["aws", "azure", "gcp", "cloud release", "cloud launch", "announcement"],

  "ERP & Enterprise Platforms (Oracle, SAP, Workday, ServiceNow, Salesforce)": ["oracle erp", "sap hana", "workday", "servicenow", "salesforce", "ebs", "fusion"],
  "E-Business Suite, Fusion & ERP Modernization": ["ebs", "fusion apps", "oracle cloud erp", "erp upgrade", "modernization"],

  "Retail & E-commerce AI Platforms": ["personalization", "recommendation engine", "ecommerce ai", "retail ai", "merchandising"],

  "Software Testing & Automation": ["qa automation", "test automation", "playwright", "selenium", "cypress"],
  "AI in Test Automation (Playwright, Cypress, Selenium, etc.)": ["ai testing", "self-healing tests", "autonomous qa", "test generation"],
  "RPA (UiPath, Automation Anywhere, BluePrism)": ["rpa", "uipath", "automation anywhere", "blueprism"],
  "Continuous Testing in CI/CD": ["continuous testing", "shift left", "ci cd testing", "pipeline"],

  "Retail/E-commerce AI Trends": ["retail ai", "e-commerce ai", "assortment", "pricing", "promotion"],
  "Supply Chain & Logistics Tech": ["supply chain ai", "logistics optimization", "warehouse automation", "fulfillment"],
  "FinTech & Banking IT Innovations": ["fintech ai", "banking ai", "digital banking", "core banking modernization"]
};

