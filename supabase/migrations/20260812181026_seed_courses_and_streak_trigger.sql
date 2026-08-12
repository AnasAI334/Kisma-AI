/*
# Add streak update function and seed sample courses

1. New Functions
- `update_streak()` — trigger function that updates the user's streak when a lesson is marked complete

2. New Triggers
- `on_lesson_progress_complete` — fires AFTER UPDATE on lesson_progress when completed changes to true

3. Seed Data
- 6 sample courses across categories (Machine Learning, Web Development, Python, Data Science, Design, Cloud)
- 5 lessons per course with full content
*/

-- ============ STREAK UPDATE FUNCTION ============
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  today date := CURRENT_DATE;
  yesterday date := CURRENT_DATE - 1;
  current_val int;
  longest_val int;
  last_date date;
BEGIN
  IF NEW.completed = true AND (OLD.completed = false OR OLD.completed IS NULL) THEN
    SELECT current_streak, longest_streak, last_activity_date
    INTO current_val, longest_val, last_date
    FROM streaks WHERE user_id = NEW.user_id;

    IF last_date IS NULL OR last_date < yesterday THEN
      current_val := 1;
    ELSIF last_date = yesterday THEN
      current_val := current_val + 1;
    ELSIF last_date = today THEN
      current_val := current_val;
    END IF;

    IF current_val > longest_val THEN
      longest_val := current_val;
    END IF;

    UPDATE streaks
    SET current_streak = current_val, longest_streak = longest_val,
        last_activity_date = today, updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_lesson_progress_complete ON lesson_progress;
CREATE TRIGGER on_lesson_progress_complete
  AFTER UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_streak();

-- ============ SEED COURSES ============
INSERT INTO courses (title, description, category, difficulty, color, icon) VALUES
('Machine Learning Basics', 'Understand the fundamentals of ML models, training, and evaluation. Perfect for beginners who want to build a strong foundation in AI.', 'AI & ML', 'Beginner', '#0F766E', 'ML'),
('Modern Web Development', 'Build responsive, modern web apps with React, Vite, and modern tooling. From HTML basics to deployment.', 'Web Dev', 'Intermediate', '#1E40AF', 'WD'),
('Python for Data Science', 'Analyze data, build visualizations, and run statistical models using Python, Pandas, and NumPy.', 'Data Science', 'Beginner', '#B45309', 'PY'),
('Deep Learning with Neural Networks', 'Dive into neural networks, backpropagation, and modern architectures like CNNs and RNNs.', 'AI & ML', 'Advanced', '#7C3AED', 'DL'),
('UI/UX Design Principles', 'Learn the fundamentals of user-centered design, prototyping, and creating beautiful interfaces.', 'Design', 'Beginner', '#DB2777', 'UX'),
('Cloud Computing Essentials', 'Master the basics of AWS, Azure, and GCP. Deploy scalable applications to the cloud.', 'Cloud', 'Intermediate', '#0891B2', 'CL')
ON CONFLICT DO NOTHING;

-- ============ SEED LESSONS ============
-- Machine Learning Basics
INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'What is Machine Learning?', 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

Instead of writing rules by hand, we feed data to algorithms that find patterns and make predictions. The more data they see, the better they get.

Key concepts:
- Training data: the examples the model learns from
- Features: the measurable properties used as input
- Labels: the target we want to predict (in supervised learning)
- Model: the mathematical representation learned from data

In this course, you will build intuition for how ML works, when to use it, and how to avoid common pitfalls.', 12, 0
FROM courses c WHERE c.title = 'Machine Learning Basics';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Supervised vs Unsupervised Learning', 'There are two main paradigms in machine learning:

Supervised Learning: The model learns from labeled examples. You give it inputs and the correct outputs, and it learns the mapping. Examples: spam detection, house price prediction, image classification.

Unsupervised Learning: The model finds structure in unlabeled data. No correct answers are given. Examples: customer segmentation, topic discovery, anomaly detection.

There is also reinforcement learning, where an agent learns by interacting with an environment and receiving rewards or penalties. Think of a game-playing AI that improves through trial and error.

Most business applications use supervised learning because it produces clear, testable predictions.', 15, 1
FROM courses c WHERE c.title = 'Machine Learning Basics';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Training and Testing Data', 'To know if a model actually works, we split our data into two sets:

Training set (typically 70-80%): Used to train the model. The algorithm sees this data and learns patterns from it.

Testing set (typically 20-30%): Held back during training. After training, we evaluate the model on this unseen data to measure real-world performance.

Why split? If we test on the same data we trained on, the model might just memorize the answers. This is called overfitting. A model that memorizes performs great on training data but poorly on new data.

A good model generalizes — it performs well on data it has never seen before.', 10, 2
FROM courses c WHERE c.title = 'Machine Learning Basics';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Common ML Algorithms', 'Here are the most widely used machine learning algorithms:

Linear Regression: Predicts a continuous number (e.g., house price from square footage). Simple but powerful as a baseline.

Logistic Regression: Predicts a probability between 0 and 1 (e.g., will a customer churn?). Used for binary classification.

Decision Trees: Splits data into branches based on feature values. Easy to interpret but prone to overfitting.

Random Forest: An ensemble of many decision trees. More accurate and robust than a single tree.

K-Means Clustering: Groups data into K clusters. Used for segmentation in unsupervised learning.

Neural Networks: Multi-layer models that can learn complex patterns. The foundation of deep learning.', 18, 3
FROM courses c WHERE c.title = 'Machine Learning Basics';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Evaluating Model Performance', 'How do you know if your model is good? It depends on the problem:

For regression (predicting numbers):
- Mean Squared Error (MSE): Average of squared differences between predicted and actual values. Lower is better.
- R-squared: How much variance the model explains, from 0 to 1. Higher is better.

For classification (predicting categories):
- Accuracy: Percentage of correct predictions. Simple but misleading on imbalanced data.
- Precision: Of the positive predictions, how many were correct?
- Recall: Of the actual positives, how many did we find?
- F1 Score: Harmonic mean of precision and recall. Good for imbalanced datasets.

Always choose metrics that match your business goal. A medical diagnosis model should prioritize recall (not missing sick patients) over precision.', 14, 4
FROM courses c WHERE c.title = 'Machine Learning Basics';

-- Modern Web Development
INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'HTML and CSS Fundamentals', 'Every web page is built with three core technologies:

HTML (HyperText Markup Language): The structure of the page. HTML elements define headings, paragraphs, images, links, and more. Think of it as the skeleton.

CSS (Cascading Style Sheets): The visual design. CSS controls colors, fonts, spacing, layout, and animations. It is the skin and clothing.

JavaScript: The behavior. JavaScript makes pages interactive — responding to clicks, fetching data, updating content without a reload.

A modern web developer needs all three. Even if you use a framework like React, understanding the fundamentals helps you debug and build better.', 12, 0
FROM courses c WHERE c.title = 'Modern Web Development';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Introduction to React', 'React is a JavaScript library for building user interfaces. It was created by Facebook and is now one of the most popular frontend tools in the world.

Core ideas:
- Components: UI is built from reusable, self-contained pieces. A button, a form, a card — each is a component.
- JSX: A syntax extension that lets you write HTML-like code inside JavaScript. It makes components readable.
- State: Data that changes over time. When state updates, React re-renders the affected components.
- Props: Data passed from parent to child components. Makes components reusable.

React uses a virtual DOM to minimize real DOM updates, making apps fast even with complex UIs.', 15, 1
FROM courses c WHERE c.title = 'Modern Web Development';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'State Management with Hooks', 'Hooks are functions that let you use state and other React features in functional components. The most common hooks:

useState: Adds local state to a component. Returns the current value and a setter. const [count, setCount] = useState(0);

useEffect: Runs side effects after render. Good for fetching data, subscribing to events, or syncing with external systems. Pass a dependency array to control when it re-runs.

useRef: Holds a mutable value that does not trigger re-renders. Useful for DOM references.

useMemo: Caches expensive calculations so they only re-run when dependencies change.

useContext: Accesses context values without prop drilling. Great for themes, auth state, and global settings.', 16, 2
FROM courses c WHERE c.title = 'Modern Web Development';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Responsive Design Principles', 'Responsive design means your app looks great on every screen — phone, tablet, and laptop. Key techniques:

Fluid Layouts: Use percentages and flexbox/grid instead of fixed pixel widths. Content adapts to the container.

Media Queries: Apply different CSS at different screen widths. Example: switch from a 3-column grid to 1-column on mobile.

Mobile-First: Start with the mobile layout, then add complexity for larger screens. This forces you to prioritize content.

Viewport Meta Tag: Tells the browser to render at the device width. Without it, mobile browsers shrink the page.

Touch Targets: Make buttons at least 44px tall for comfortable tapping on touch screens.

Test on real devices. Emulators are helpful but nothing beats holding the phone in your hand.', 13, 3
FROM courses c WHERE c.title = 'Modern Web Development';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Building and Deploying with Vite', 'Vite is a modern build tool that makes development fast and simple. It uses native ES modules for instant server start and hot module replacement.

Why Vite?
- Dev server starts in milliseconds, even for large projects.
- Hot Module Replacement (HMR) updates changed modules instantly without full reload.
- Production build uses Rollup for optimized, tree-shaken bundles.

Creating a project: npm create vite@latest my-app -- --template react

Development: npm run dev — starts the dev server.

Building: npm run build — outputs optimized files to dist/.

Preview: npm run preview — serves the production build locally.

Deploy by uploading the dist/ folder to any static host: Netlify, Vercel, GitHub Pages, or your own server.', 11, 4
FROM courses c WHERE c.title = 'Modern Web Development';

-- Python for Data Science
INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Getting Started with Python', 'Python is the most popular language for data science because it is easy to read and has a massive ecosystem of data libraries.

Installing Python: Download from python.org or use a package manager. Python 3.10+ is recommended.

Your first program: print("Hello, Data!")

Key data types:
- int and float: numbers for calculations
- str: text data
- list: ordered, mutable sequence
- dict: key-value pairs, great for structured data
- bool: True or False

Python uses indentation (not braces) to define code blocks. Four spaces is the standard. This makes code visually clean but requires consistency.', 10, 0
FROM courses c WHERE c.title = 'Python for Data Science';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'NumPy Arrays', 'NumPy is the foundation of scientific computing in Python. It provides fast, multi-dimensional arrays.

Why NumPy?
- Python lists are slow for numeric operations. NumPy arrays are implemented in C and are 10-100x faster.
- Supports vectorized operations: array1 + array2 adds element-by-element without a loop.
- Broadcasting: operations between arrays of different shapes work automatically.

Key operations:
- np.array([1, 2, 3]) — create an array
- arr.shape — get dimensions
- arr.mean(), arr.std() — statistics
- arr.reshape(2, 3) — change shape
- np.random.rand(100) — generate random data

Most data science libraries (Pandas, scikit-learn, TensorFlow) are built on top of NumPy.', 14, 1
FROM courses c WHERE c.title = 'Python for Data Science';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Data Analysis with Pandas', 'Pandas is the most important tool for data manipulation in Python. It introduces two key structures:

Series: A one-dimensional labeled array. Think of it as a single column in a spreadsheet.

DataFrame: A two-dimensional labeled table. It is like a spreadsheet or SQL table that lives in memory.

Common operations:
- pd.read_csv("data.csv") — load data from a file
- df.head() — view the first 5 rows
- df.describe() — get summary statistics
- df.groupby("category")["value"].mean() — group and aggregate
- df.sort_values("column", ascending=False) — sort
- df.fillna(0) — handle missing values

Pandas makes it easy to clean, transform, and explore data before feeding it to ML models.', 16, 2
FROM courses c WHERE c.title = 'Python for Data Science';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Data Visualization with Matplotlib', 'Visualization is how you communicate insights. A good chart tells a story that numbers alone cannot.

Matplotlib is the standard plotting library in Python. It gives you full control over every element of a chart.

Basic chart types:
- Line chart: plt.plot(x, y) — shows trends over time
- Bar chart: plt.bar(categories, values) — compares quantities
- Scatter plot: plt.scatter(x, y) — shows relationships between two variables
- Histogram: plt.hist(data, bins=20) — shows the distribution of a variable

Always label your axes, add a title, and choose colors that are readable. A chart without labels is just decoration.

For more polished charts with less code, try Seaborn, which is built on top of Matplotlib.', 12, 3
FROM courses c WHERE c.title = 'Python for Data Science';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Statistical Analysis Basics', 'Statistics is the language of data. Before building models, you need to understand your data statistically.

Descriptive statistics summarize data:
- Mean: the average value
- Median: the middle value (less sensitive to outliers)
- Standard deviation: how spread out the data is
- Quartiles: divide data into four equal parts

Inferential statistics draw conclusions from samples:
- Hypothesis testing: Is the difference between two groups real or just noise?
- P-value: The probability of seeing this result by chance. Below 0.05 is a common threshold.
- Confidence intervals: A range that likely contains the true value.

Correlation measures how two variables move together (from -1 to +1). But correlation does not imply causation — a common trap in data analysis.', 15, 4
FROM courses c WHERE c.title = 'Python for Data Science';

-- Deep Learning
INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Neural Networks: An Overview', 'A neural network is a model inspired by the human brain. It consists of layers of interconnected nodes (neurons) that process information.

Architecture:
- Input layer: receives the raw data
- Hidden layers: transform the data through weighted connections
- Output layer: produces the prediction

Each connection has a weight (importance) and each neuron applies an activation function (a non-linear transformation). The network learns by adjusting these weights to minimize prediction error.

Deep learning simply means neural networks with many hidden layers. The depth allows them to learn hierarchical features — from edges to shapes to objects in images.', 14, 0
FROM courses c WHERE c.title = 'Deep Learning with Neural Networks';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Forward and Backward Propagation', 'Training a neural network involves two passes through the network:

Forward propagation: Data flows from input to output. Each layer computes weighted sums and applies activation functions. The final layer produces a prediction.

Loss function: Measures how far the prediction is from the truth. Common choices: mean squared error for regression, cross-entropy for classification.

Backward propagation (backprop): The network calculates how much each weight contributed to the error, using the chain rule from calculus. Gradients flow backward from the output to the input.

Optimization: An algorithm (like gradient descent or Adam) adjusts the weights in the direction that reduces the loss. This cycle repeats thousands of times during training.

Learning rate controls how big each adjustment is. Too high and the model diverges; too low and training takes forever.', 18, 1
FROM courses c WHERE c.title = 'Deep Learning with Neural Networks';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Convolutional Neural Networks (CNNs)', 'CNNs are neural networks designed for images. They have revolutionized computer vision.

Key layers:
- Convolutional layer: Scans the image with small filters (kernels) that detect features like edges, corners, and textures. Early layers find simple patterns; deeper layers find complex ones like faces and objects.
- Pooling layer: Reduces the spatial size, keeping the most important information and making the network faster.
- Fully connected layer: At the end, flattens the features and makes the final classification.

Why CNNs work for images: They respect spatial structure. A regular neural network treats each pixel independently, but CNNs look at local regions, which is how vision works in nature.

Famous CNN architectures: LeNet, AlexNet, ResNet, EfficientNet. Each pushed the state of the art further.', 16, 2
FROM courses c WHERE c.title = 'Deep Learning with Neural Networks';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Recurrent Neural Networks (RNNs)', 'RNNs are designed for sequential data — text, speech, time series, or anything where order matters.

How they work: An RNN processes one element of the sequence at a time. It maintains a hidden state that carries information from previous steps. This gives it a form of memory.

The problem: Standard RNNs struggle with long sequences. Gradients either vanish (become too small to learn) or explode (become too large and unstable). This is the vanishing gradient problem.

The solution: LSTM (Long Short-Term Memory) and GRU (Gated Recurrent Unit) networks. They use gates to control what information is kept or forgotten, allowing them to learn long-range dependencies.

Today, Transformers have largely replaced RNNs for many tasks, but RNNs remain useful for real-time and low-latency applications.', 15, 3
FROM courses c WHERE c.title = 'Deep Learning with Neural Networks';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Training Tips and Best Practices', 'Training deep learning models is part science, part art. Here are the most important practices:

Data: More and better data beats fancier models. Augment your data (flip, rotate, crop images) to artificially expand your dataset.

Regularization: Prevent overfitting with dropout (randomly disabling neurons), L2 weight decay, and early stopping (stop when validation loss starts rising).

Batch normalization: Normalizes layer inputs to stabilize training. Allows higher learning rates and faster convergence.

Transfer learning: Start with a pre-trained model (like ResNet or BERT) and fine-tune on your data. This works even with small datasets and saves enormous compute.

Hyperparameter tuning: Learning rate is the most important. Use techniques like grid search, random search, or Bayesian optimization.

Monitor training: Always plot training and validation loss. If they diverge, you are overfitting. If both are high, you are underfitting.', 17, 4
FROM courses c WHERE c.title = 'Deep Learning with Neural Networks';

-- UI/UX Design
INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'What is User-Centered Design?', 'User-centered design (UCD) is a philosophy: design products around the needs, wants, and limitations of users — not around what the designer thinks is cool.

The UCD process:
1. Understand: Research your users. Who are they? What are their goals? What frustrates them?
2. Specify: Define the problem clearly. What user needs must the product address?
3. Design: Create solutions. Sketch, wireframe, prototype.
4. Evaluate: Test with real users. Watch them use the product. Learn what confuses them.
5. Repeat: Iterate based on feedback. Design is never done on the first try.

The golden rule: You are not your user. What seems obvious to you may be confusing to them. Test, do not assume.', 10, 0
FROM courses c WHERE c.title = 'UI/UX Design Principles';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Visual Hierarchy and Typography', 'Visual hierarchy guides the eye to what matters most. Without it, everything competes for attention and nothing stands out.

Techniques for hierarchy:
- Size: Larger elements are seen first. Headlines should be significantly bigger than body text.
- Color: Bright or contrasting colors draw attention. Use them sparingly for key actions.
- Spacing: More space around an element makes it feel more important. Whitespace is not wasted — it is structure.
- Position: Top-left (in left-to-right languages) gets the most attention. Important content goes first.

Typography rules:
- Use 1-2 font families. More looks messy.
- Body text: 16px minimum, 1.5 line height for readability.
- Headings: 1.2 line height, clearly larger than body.
- Maximum 3 font weights. Consistency is key.
- Ensure sufficient contrast: dark text on light backgrounds, and vice versa.', 13, 1
FROM courses c WHERE c.title = 'UI/UX Design Principles';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Color Theory for Interfaces', 'Color is one of the most powerful tools in design. It sets mood, creates hierarchy, and communicates meaning.

The 60-30-10 rule: Use a primary color 60% of the time, a secondary 30%, and an accent 10%. This creates balance without overwhelming.

Color psychology: Different colors evoke different feelings. Blue conveys trust (used by banks and tech). Green suggests growth and health. Red signals urgency or error. Choose colors that match your product personality.

Accessibility: Maintain a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text. Tools like WebAIM Contrast Checker help verify this. Never rely on color alone to convey information — colorblind users will miss it.

Consistency: Define a color system with shades (50, 100, 500, 700, 900) and use them consistently. This is what makes interfaces feel professional.', 12, 2
FROM courses c WHERE c.title = 'UI/UX Design Principles';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Wireframing and Prototyping', 'Wireframes are low-fidelity sketches of a page. They show structure and layout without colors, images, or detailed styling. The goal is to focus on what goes where before worrying about how it looks.

Prototypes are interactive. They let you click through a flow as if the product were real. This is where you test whether the design actually works.

Tools:
- Paper and pen: Fastest wireframing. No learning curve. Perfect for early ideas.
- Figma: Industry standard for both wireframes and prototypes. Free for individuals.
- Balsamiq: Deliberately rough-looking wireframes that keep focus on structure.

Process: Start with paper sketches. Move to digital wireframes. Add interactivity for the prototype. Test with users. Iterate. Only then move to high-fidelity visual design.

The biggest mistake: jumping to visual design before validating the structure. A beautiful interface with bad flow still fails.', 14, 3
FROM courses c WHERE c.title = 'UI/UX Design Principles';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Usability Testing', 'Usability testing means watching real people use your product to find where they struggle. It is the most valuable thing you can do in design.

How to run a simple test:
1. Find 5 participants who match your target user. Five is enough to find most problems.
2. Give them a task: "Sign up for an account and find the Machine Learning course."
3. Watch them do it. Do not help. Do not explain. Just observe.
4. Take notes on where they hesitate, get confused, or make mistakes.
5. Afterward, ask them what they found confusing.

What to look for:
- Where do they click first? Is it the right thing?
- Do they read instructions or ignore them?
- Where do they get stuck or go back?
- What words do they use to describe things? (Use those words in your UI.)

Test early and test often. Testing a paper sketch is better than testing a finished product that took months to build.', 11, 4
FROM courses c WHERE c.title = 'UI/UX Design Principles';

-- Cloud Computing
INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Introduction to Cloud Computing', 'Cloud computing means delivering computing services — servers, storage, databases, networking, software — over the internet instead of owning physical hardware.

Why cloud?
- Pay for what you use, not what you own.
- Scale up or down in minutes, not months.
- No need to maintain a data center.
- Global reach: deploy to regions close to your users.

Service models:
- IaaS (Infrastructure as a Service): You rent virtual machines and networking. You manage the OS and apps. Example: AWS EC2.
- PaaS (Platform as a Service): The provider manages the OS and runtime. You just deploy your code. Example: Google App Engine.
- SaaS (Software as a Service): Fully managed software. You just use it. Example: Gmail, Slack.

The three major providers are AWS, Microsoft Azure, and Google Cloud Platform (GCP).', 12, 0
FROM courses c WHERE c.title = 'Cloud Computing Essentials';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'AWS Core Services', 'Amazon Web Services (AWS) is the largest cloud provider, with over 200 services. Here are the core ones you need to know:

Compute:
- EC2: Virtual servers you configure and control.
- Lambda: Run code without managing servers. Pay per execution.
- ECS/EKS: Container orchestration (Docker and Kubernetes).

Storage:
- S3: Object storage for files, images, backups. Infinite scale.
- EBS: Block storage attached to EC2 instances.

Database:
- RDS: Managed relational databases (PostgreSQL, MySQL).
- DynamoDB: NoSQL database for fast, flexible data.

Networking:
- VPC: Your private network in the cloud.
- CloudFront: Content delivery network (CDN) for fast global delivery.
- Route 53: DNS management.

Start with EC2, S3, and RDS. These three cover most application needs.', 15, 1
FROM courses c WHERE c.title = 'Cloud Computing Essentials';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Azure and GCP Overview', 'Microsoft Azure and Google Cloud Platform are the other two major clouds. Each has unique strengths.

Azure:
- Strong in enterprise environments, especially companies already using Microsoft products.
- Azure Functions: Serverless compute (like AWS Lambda).
- Azure Blob Storage: Object storage (like S3).
- Azure SQL Database: Managed SQL Server.
- Excellent hybrid cloud support with Azure Arc.

Google Cloud Platform (GCP):
- Leader in data and AI/ML with BigQuery and Vertex AI.
- Compute Engine: Virtual machines.
- Cloud Storage: Object storage.
- Cloud Functions: Serverless compute.
- GKE (Google Kubernetes Engine): Best managed Kubernetes experience.

Which to choose? If you are deep in the Microsoft ecosystem, Azure. If your focus is data and ML, GCP. For general-purpose and the largest ecosystem, AWS. In practice, many companies use multiple clouds.', 14, 2
FROM courses c WHERE c.title = 'Cloud Computing Essentials';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Deploying a Web Application', 'Let us walk through deploying a simple web app to the cloud. The steps are similar across providers.

1. Containerize your app: Write a Dockerfile that packages your app and its dependencies into a container image. This makes it portable across environments.

2. Push the image to a registry: AWS ECR, Azure Container Registry, or Google Artifact Registry. This is where the cloud finds your code.

3. Deploy to a compute service:
   - Simple: Run the container on EC2 or a managed container service.
   - Serverless: Use AWS App Runner, Azure Container Apps, or Cloud Run. These scale to zero when idle.

4. Configure networking: Set up a load balancer to distribute traffic, and a CDN for static assets.

5. Set up a database: Use a managed database service (RDS, Azure SQL, Cloud SQL) so you do not manage backups and patches yourself.

6. Add monitoring: CloudWatch (AWS), Azure Monitor, or Cloud Logging (GCP). Know when things break before your users do.

7. Set up CI/CD: Automate deployments so every code change flows through a pipeline and deploys with zero manual steps.', 16, 3
FROM courses c WHERE c.title = 'Cloud Computing Essentials';

INSERT INTO lessons (course_id, title, content, duration_minutes, order_index)
SELECT c.id, 'Cloud Security Best Practices', 'Security in the cloud is a shared responsibility. The provider secures the infrastructure; you secure what you put in it.

Identity and access:
- Use IAM (Identity and Access Management) to control who can do what.
- Follow least privilege: give each user or service only the permissions they need.
- Never use root/admin credentials for day-to-day work.
- Enable multi-factor authentication (MFA) for all human users.

Data protection:
- Encrypt data at rest (storage) and in transit (network). Most services support this with a checkbox.
- Use secrets managers (AWS Secrets Manager, Azure Key Vault) for API keys and passwords. Never hardcode secrets.
- Regular backups. Test that you can restore them.

Network security:
- Use security groups and firewalls to restrict inbound traffic.
- Put databases in private subnets, not accessible from the internet.
- Use a VPN or bastion host for administrative access.

Compliance: Know which regulations apply (GDPR, HIPAA, SOC 2). Cloud providers offer compliance certifications, but you are responsible for configuring your resources correctly.', 13, 4
FROM courses c WHERE c.title = 'Cloud Computing Essentials';
