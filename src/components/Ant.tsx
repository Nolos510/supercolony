export default function Ant({ large = false }: { large?: boolean }) {
  return <svg className={large ? 'ant-specimen' : 'ant-symbol'} viewBox="0 0 300 180" role="img" aria-label="Illustrated ant specimen: head, thorax, abdomen, and six legs">
    <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M107 92 86 47 49 33 22 41M102 103 77 73 47 66 19 72M141 91 140 39 169 20 189 16M144 113 133 150 160 169 189 171M172 94 191 52 220 48 247 59M174 116 197 146 231 153 264 147" />
      <path d="M68 87 46 66 34 45M69 105 44 120 23 121M40 43 18 29M47 121 20 144M83 92 72 71 55 71M81 108 70 123 54 120" />
      <path d="M195 85 C219 62 250 67 268 89 C282 108 263 135 238 135 C218 134 201 124 193 111 Z" />
      <path d="M209 79 C230 83 245 103 246 128M230 73 C250 86 261 104 262 118M199 92 C217 96 228 112 229 132" opacity=".5" />
      <path d="M178 88 C190 85 198 92 197 102 C197 114 186 120 178 111 ZM118 80 C145 71 179 82 183 103 C182 120 149 126 119 114 C110 105 110 90 118 80 Z" />
      <path d="M118 83 C129 98 129 109 120 114M144 79 C150 94 150 110 146 119M164 85 C170 97 169 109 165 116" opacity=".4" />
      <path d="M91 82 C98 75 113 79 118 89 C123 102 112 120 99 119 L86 113 C73 108 70 94 77 86 ZM80 85 67 91 66 108 84 114" />
      <ellipse cx="82" cy="93" rx="3" ry="4" fill="currentColor" />
      <path d="M193 89 204 71M191 116 200 136M93 81 89 63M105 119 99 140" strokeWidth=".7" opacity=".5" />
    </g>
  </svg>;
}
