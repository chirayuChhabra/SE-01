export const sample = `# A little clarity goes a long way.

Good lessons start with a simple idea. This is a space to turn your **rough notes** into something worth reading.

## Making sense of fractions

A fraction describes a part of a whole. The **denominator** tells us how many equal parts there are; the **numerator** tells us how many we have.

> [!TIP]
> Start with something familiar. Cut a pizza into eight equal slices. Three slices make **3/8** of the pizza.

### The building blocks

- Divide the whole into **equal parts**.
- Count the parts you want to describe.
- Write the count above the total number of parts.

> Understanding is knowing why, not just knowing how.

## A small example

Here’s the same idea, expressed in a few lines of code:

\`\`\`javascript
function fraction(part, whole) {
  return part / whole;
}

const threeSlices = fraction(3, 8);
// 0.375 — a little more than one third
\`\`\`

| Fraction | In words | Decimal |
| :--- | :--- | ---: |
| 1/2 | One half | 0.5 |
| 1/4 | One quarter | 0.25 |
| 3/8 | Three eighths | 0.375 |

---

> [!NOTE]
> Try changing this lesson on the left. Your preview updates as you write, and your draft stays in this browser.

Made with a little care, and a little Markdown. [Learn the syntax](https://www.markdownguide.org/basic-syntax/).
`;
export const snippets = {
  heading: '\n## A new section\n\nWrite something useful.\n',
  callout: '\n> [!TIP]\n> A helpful detail worth remembering.\n',
  code: '\n```javascript\nconst idea = "Make it clear.";\nconsole.log(idea);\n```\n',
  quote: '\n> A thought worth sharing.\n',
  table: '\n| Concept | Meaning |\n| --- | --- |\n| Numerator | Parts we have |\n| Denominator | Equal parts in the whole |\n',
  list: '\n- First idea\n- Second idea\n- Third idea\n',
  image: '\n![Describe your image](https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop)\n',
  divider: '\n\n---\n\n',
};
