import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 清理旧数据
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 创建用户
  const adminHash = await bcrypt.hash("admin123", 10);
  const user1Hash = await bcrypt.hash("user123", 10);
  const user2Hash = await bcrypt.hash("user456", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: adminHash,
      email: "admin@blog-xlab.com",
      role: "ADMIN",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      username: "zhangsan",
      passwordHash: user1Hash,
      email: "zhangsan@blog-xlab.com",
      role: "USER",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: "lisi",
      passwordHash: user2Hash,
      email: "lisi@blog-xlab.com",
      role: "USER",
    },
  });

  console.log("✅ 用户创建完成");

  // 创建文章
  const post1 = await prisma.post.create({
    data: {
      title: "深入理解 TypeScript 泛型与类型体操",
      slug: "typescript-generics-deep-dive",
      content: `# 深入理解 TypeScript 泛型与类型体操

TypeScript 的泛型系统是它最强大的特性之一。本文将带你深入理解泛型的高级用法。

## 什么是泛型？

泛型允许我们在定义函数、接口或类时不预先指定具体的类型，而在使用时再指定。

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("hello");
const inferred = identity(42); // 自动推断
\`\`\`

## 泛型约束

我们可以使用 \`extends\` 关键字来约束泛型的范围：

\`\`\`typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // ✅
logLength([1, 2, 3]); // ✅
// logLength(123); // ❌ number 没有 length 属性
\`\`\`

## 条件类型与 infer

TypeScript 的条件类型让我们能够进行更复杂的类型运算：

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<42>;      // false

// 使用 infer 提取类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

type GreetReturn = ReturnType<typeof greet>; // string
\`\`\`

## 模板字面量类型

TypeScript 4.1 引入了模板字面量类型：

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type ClickEvent = EventName<"click">; // "onClick"
type FocusEvent = EventName<"focus">; // "onFocus"
\`\`\`

## 数学公式示例

在计算机科学中，算法的复杂度分析常涉及数学公式。例如，二分查找的时间复杂度为：

$$
T(n) = O(\\log_2 n)
$$

快速排序的平均时间复杂度为：

$$
T(n) = \\begin{cases}
O(1) & \\text{if } n \\leq 1 \\\\
O(n \\log n) & \\text{otherwise}
\\end{cases}
$$

## 总结

泛型是 TypeScript 类型系统的核心，掌握它能让你写出更安全、更灵活的代码。从基础的类型参数到高级的条件类型，泛型为 JavaScript 提供了强大的类型抽象能力。
`,
      published: true,
      authorId: admin.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "React 18 并发特性完全指南",
      slug: "react-18-concurrent-features",
      content: `# React 18 并发特性完全指南

React 18 引入了全新的并发渲染机制，这篇文章将全面介绍其核心特性。

## 并发渲染是什么？

并发渲染是 React 18 最根本的变化。它允许 React 在渲染过程中"中断"和"恢复"工作，使 UI 在高开销渲染时仍能保持响应。

\`\`\`tsx
import { startTransition } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;

    // 紧急更新：立即更新输入框
    setQuery(value);

    // 非紧急更新：可以被中断
    startTransition(() => {
      const filtered = searchData(value);
      setResults(filtered);
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      <ResultList results={results} />
    </div>
  );
}
\`\`\`

## useDeferredValue

\`useDeferredValue\` 让你可以延迟更新 UI 中不太重要的部分：

\`\`\`tsx
import { useDeferredValue } from 'react';

function ProductList({ products }: { products: Product[] }) {
  const deferredProducts = useDeferredValue(products);

  return (
    <ul>
      {deferredProducts.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Suspense 的改进

React 18 中 Suspense 现在支持服务端渲染和流式 HTML：

\`\`\`tsx
function ProfilePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProfileDetails />
      <Suspense fallback={<Skeleton />}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}
\`\`\`

## 性能分析

使用 React.lazy 进行代码分割后，假设主包大小为 $M$，懒加载模块大小为 $L$，首屏加载时间可以简化为：

$$
T_{\\text{load}} = \\frac{M}{B} + T_{\\text{parse}}(M)
$$

其中 $B$ 为网络带宽，$T_{\\text{parse}}$ 为 JS 解析时间函数。

## 总结

React 18 的并发特性标志着 React 渲染模型的重大进化，让开发者能够创建更流畅的用户体验。
`,
      published: true,
      authorId: admin.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: "现代 CSS 布局完全指南：从 Flexbox 到 Grid",
      slug: "modern-css-layout-guide",
      content: `# 现代 CSS 布局完全指南：从 Flexbox 到 Grid

CSS 布局在过去十年发生了翻天覆地的变化。本文将从 Flexbox 到 Grid，全面介绍现代 CSS 布局方案。

## Flexbox 布局

Flexbox 是一维布局方案，适合处理行或列方向上的元素排列：

\`\`\`css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.item {
  flex: 1;
  min-width: 0; /* 防止溢出 */
}
\`\`\`

## CSS Grid 布局

Grid 是二维布局方案，可以同时控制行和列：

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.header {
  grid-column: 1 / -1; /* 横跨所有列 */
}
\`\`\`

## Container Queries

容器查询让组件可以根据自身容器的大小而非视口大小来调整样式：

\`\`\`css
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}
\`\`\`

## 响应式设计的数学基础

为了实现流畅的响应式排版，我们可以使用 CSS clamp() 函数配合线性插值：

$$
f(v) = \\min\\left(\\max\\left(\\text{minSize}, \\frac{v - v_{\\text{min}}}{v_{\\text{max}} - v_{\\text{min}}} \\times (\\text{maxSize} - \\text{minSize}) + \\text{minSize}\\right), \\text{maxSize}\\right)
$$

其中 $v$ 为当前视口宽度，$v_{\\text{min}}$ 和 $v_{\\text{max}}$ 为视口断点。

## 黄金比例在布局中的应用

黄金比例 $\\varphi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618$ 可以用来创建视觉上和谐的布局：

$$
\\text{content} : \\text{sidebar} = \\varphi : 1
$$

## 总结

掌握 Flexbox 和 Grid 是每个前端开发者的基本功。结合容器查询和数学化的响应式方案，我们能创建出适应各种设备的优雅布局。
`,
      published: true,
      authorId: admin.id,
    },
  });

  console.log("✅ 文章创建完成");

  // 创建评论
  await prisma.comment.createMany({
    data: [
      { content: "非常棒的 TypeScript 教程！泛型一直是我最困惑的部分，终于搞清楚了。", postId: post1.id, authorId: user1.id },
      { content: "条件类型那边的解释特别清晰，期待更多这样的深度文章。", postId: post1.id, authorId: user2.id },
      { content: "React 18 的并发模式确实很强大，但迁移成本也不低。", postId: post2.id, authorId: user1.id },
      { content: "CSS Grid 太好用了，配合 container queries 能解决很多之前需要 JS 的问题。", postId: post3.id, authorId: user2.id },
      { content: "建议作者也出一篇 Tailwind CSS 的深度教程！", postId: post3.id, authorId: user1.id },
    ],
  });

  console.log("✅ 评论创建完成");

  // 创建点赞
  await prisma.like.createMany({
    data: [
      { postId: post1.id, userId: user1.id },
      { postId: post1.id, userId: user2.id },
      { postId: post1.id, userId: admin.id },
      { postId: post2.id, userId: user1.id },
      { postId: post2.id, userId: user2.id },
      { postId: post3.id, userId: admin.id },
      { postId: post3.id, userId: user1.id },
    ],
  });

  console.log("✅ 点赞创建完成");
  console.log("\n📦 种子数据注入完毕！");
  console.log("  管理员: admin / admin123");
  console.log("  用户1: zhangsan / user123");
  console.log("  用户2: lisi / user456");
}

main()
  .catch((e) => {
    console.error("❌ 种子数据注入失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
