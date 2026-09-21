export interface BlogPost {
  slug: string
  title: string
  description: string
  category: string
  publishedAt: string
  readTime: string
  author: {
    name: string
    avatarInitials: string
    avatarColor: string
  }
  bannerGradient: string
  contentHtml: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "5-ways-to-10x-productivity-kanban",
    title: "5 Ways to 10x Your Productivity Using Kanban Boards",
    description: "Discover the hidden workflows and mental models that high-performing teams use to deliver software at lightning speeds.",
    category: "Productivity",
    publishedAt: "July 2, 2026",
    readTime: "5 min read",
    author: {
      name: "Alex Rivera",
      avatarInitials: "AR",
      avatarColor: "bg-blue-650"
    },
    bannerGradient: "from-blue-600 to-indigo-700",
    contentHtml: `
      <p class="text-slate-350">If you've ever felt overwhelmed by a massive, chaotic to-do list, you're not alone. In today's fast-paced environment, keeping track of tasks, priorities, and deadlines can feel like a full-time job itself. That's where the Kanban board comes in. Originally designed by Toyota to optimize manufacturing, Kanban has evolved into one of the most popular tools for agile software development and personal productivity.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">1. Limit Your Work in Progress (WIP)</h3>
      <p class="text-slate-355">The single most important rule of Kanban is limiting your Work in Progress. When you juggle too many tasks simultaneously, you pay a heavy price in "context switching." By capping the number of cards allowed in your "In Progress" column (e.g., maximum 3 tasks), you force yourself to complete existing tasks before taking on new ones. Stop starting, start finishing!</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">2. Visualize Your Full Workflow</h3>
      <p class="text-slate-355">Many teams make the mistake of having simple columns: To Do, In Progress, and Done. In reality, your workflow might involve steps like Code Review, QA Testing, or Awaiting Feedback. Expanding your columns to accurately reflect every transition point exposes hidden bottlenecks and wait times immediately.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">3. Use Card Colors and Priority Badges Strategically</h3>
      <p class="text-slate-355">A visual board should tell a story at a glance. Use priority tags (Low, Medium, High) and clear color codes to separate feature development, bug fixes, and critical operations. In Thunder Kanban, these badges let you focus on what's truly urgent without scanning through pages of text.</p>

      <blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-6 bg-slate-900/50 rounded-r-lg italic text-slate-300">
        "Kanban isn't just about organizing tasks; it is a philosophy of continuous improvement and flow optimization."
      </blockquote>

      <h3 class="text-xl font-bold text-white mt-6 mb-3">4. Focus on Flow, Not Just Activity</h3>
      <p class="text-slate-355">Being busy is not the same as being productive. Monitor how quickly a card moves from the initial column to "Done" (known as cycle time). If cards are piling up in "Testing," reallocate resources to resolve the block. Optimization is a team sport.</p>

      <h3 class="text-xl font-bold text-white mt-6 mb-3">5. Conduct Regular Standups and Retrospectives</h3>
      <p class="text-slate-355">A Kanban board is a living document. Spend 5-10 minutes every morning reviewing the board with your team. Address cards that haven't moved in days. Every two weeks, look back and ask: How can we make our boards flow even faster?</p>
    `
  },
  {
    slug: "future-of-collaboration-realtime-kanban",
    title: "Why Light-speed Collaboration is the Future of Project Management",
    description: "Why traditional static tracking tools are holding teams back, and how real-time, fluid collaboration increases shipping velocity.",
    category: "Collaboration",
    publishedAt: "June 28, 2026",
    readTime: "4 min read",
    author: {
      name: "Sarah Chen",
      avatarInitials: "SC",
      avatarColor: "bg-purple-650"
    },
    bannerGradient: "from-purple-600 to-pink-700",
    contentHtml: `
      <p class="text-slate-350">We've all been there: you update a ticket, send a Slack message to notify a colleague, wait for them to see it, and hope they don't work on stale information. In a remote-first world, delay equals death. The future belongs to tools that update at the speed of thought.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">Breaking Down Silos</h3>
      <p class="text-slate-355">Traditional project management software acts as a database of record, updated retrospectively. Modern collaboration tools act as virtual workspaces. When drag-and-drop actions, assignees, and comment threads synchronize in real-time, the overhead of status reports disappears. You know what your team is doing because you can see the cards glide across the board.</p>

      <h3 class="text-xl font-bold text-white mt-6 mb-3">The Psychology of Shared Workspaces</h3>
      <p class="text-slate-355">There is a profound psychological benefit to seeing your team's collective momentum. A shared Kanban board builds a sense of virtual presence. When a task changes status, it triggers a minor dopamine hit for the team—a shared win that keeps spirits high and momentum going.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">Enter Thunder Kanban</h3>
      <p class="text-slate-355">Thunder Kanban was built from the ground up to solve collaboration delays. With instant state synchronization, fluid gestures, and instant load times, it bridges the gap between individual focus and team coordination. No lag, no duplicate work—just pure progress.</p>
    `
  },
  {
    slug: "iceberg-method-task-prioritization",
    title: "Mastering the Art of Task Prioritization: The Iceberg Method",
    description: "Learn how to filter out low-value noise and prioritize tasks based on their systemic impact rather than visible urgency.",
    category: "Agile Development",
    publishedAt: "June 15, 2026",
    readTime: "6 min read",
    author: {
      name: "Marcus Aureli",
      avatarInitials: "MA",
      avatarColor: "bg-emerald-650"
    },
    bannerGradient: "from-emerald-600 to-teal-700",
    contentHtml: `
      <p class="text-slate-350">Most tasks are like icebergs: what is visible on the surface is only a fraction of their true weight. Urgent emails, quick bug fixes, and meeting follow-ups crowd our days, while the large, systemic projects remain submerged and untouched. To break this cycle, you need a framework that separates surface noise from strategic impact.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">Defining the Iceberg</h3>
      <p class="text-slate-355">The Iceberg Method categorizes tasks into three depths:</p>
      <ul class="list-disc pl-6 space-y-2 text-slate-355 my-4">
        <li><strong>Surface Tasks:</strong> Low cognitive load, high visibility. They feel urgent but have low long-term ROI (e.g. status updates).</li>
        <li><strong>Mid-depth Tasks:</strong> Necessary operations. They maintain your momentum (e.g. reviewing pulls, fixing active regressions).</li>
        <li><strong>Deep-impact Tasks:</strong> High cognitive load, low visibility. These projects refactor architecture, build new product verticals, or automate workflows, yielding compounding returns.</li>
      </ul>

      <h3 class="text-xl font-bold text-white mt-6 mb-3">Flipping the Iceberg</h3>
      <p class="text-slate-355">To succeed, you must dedicate your peak energy periods to Deep-impact tasks before addressing surface-level requests. Block out the first 90 minutes of your workday for deep, focused project building. Pin these deep tasks to the top of your Kanban board as sticky cards that command your focus.</p>
    `
  }
]
