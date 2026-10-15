# Styled [t:red]title[/t]

A [t:red]red[/t] word, a [t:blue:24pt]big blue[/t] one, and a [t::small]small[/t] one.

Brand color from the theme: [t:var(--vp-c-brand-1)]brand[/t].

Nested: [t:red]outer [t::2em]inner[/t] outer[/t].

Markdown inside: [t:green]**bold** and `code`[/t].

Generics still escape inside a span: [t:red]Array<string>[/t].

Code is left alone: `[t:red]inline[/t]`.

```md
[t:red]fenced[/t]
```

Invalid values are shown as written: [t:notacolor!]text[/t].
