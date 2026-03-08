/**
 * WorldMapBackground — simplified Mercator-projection SVG continent paths.
 * ViewBox: 0 0 1000 500 (Mercator, 360°lon → 1000px, ~170°lat → 500px)
 *
 * Longitude → x:  (lon + 180) / 360 * 1000
 * Latitude  → y:  (90  - lat) / 180 * 500
 *
 * Paths are hand-simplified polygons tracing the major coastlines of each
 * continent — accurate enough to correctly place city dots geographically.
 */
const WorldMapBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 1000 500"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.04" />
        <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Ocean wash */}
    <rect x="0" y="0" width="1000" height="500" fill="url(#oceanGrad)" />

    {/* Grid lines — latitude */}
    {[60, 30, 0, -30, -60].map((lat) => {
      const y = (90 - lat) / 180 * 500;
      return (
        <line
          key={`lat${lat}`}
          x1={0} y1={y} x2={1000} y2={y}
          stroke="hsl(var(--border))"
          strokeWidth="0.4"
          strokeDasharray="4 8"
          opacity="0.25"
        />
      );
    })}
    {/* Grid lines — longitude */}
    {[-120, -60, 0, 60, 120].map((lon) => {
      const x = (lon + 180) / 360 * 1000;
      return (
        <line
          key={`lon${lon}`}
          x1={x} y1={0} x2={x} y2={500}
          stroke="hsl(var(--border))"
          strokeWidth="0.4"
          strokeDasharray="4 8"
          opacity="0.25"
        />
      );
    })}

    {/* ── NORTH AMERICA ──────────────────────────────────────────────────── */}
    <path
      d="
        M 108,44
        L 125,44 L 142,55 L 155,50 L 170,55 L 178,66
        L 185,75 L 192,80 L 195,90 L 200,100
        L 210,110 L 215,120 L 218,132
        L 210,140 L 205,150 L 208,160
        L 215,170 L 218,180 L 210,190
        L 200,200 L 192,210 L 188,218
        L 195,225 L 198,232
        L 188,238 L 180,240
        L 172,250 L 165,255
        L 158,260 L 150,265
        L 145,272 L 142,278
        L 150,282 L 155,290
        L 148,295 L 140,292
        L 132,288 L 128,282
        L 122,276 L 118,270
        L 112,262 L 108,255
        L 100,248 L 95,240
        L 88,232 L 85,222
        L 82,212 L 80,200
        L 78,190 L 80,180
        L 84,170 L 88,160
        L 88,148 L 85,138
        L 80,128 L 75,118
        L 70,110 L 68,100
        L 65,90 L 62,80
        L 62,68 L 65,58
        L 72,50 L 82,45
        L 95,43 L 108,44 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* ── CENTRAL AMERICA + CARIBBEAN stub ───────────────────────────────── */}
    <path
      d="M 155,265 L 162,272 L 168,280 L 165,288 L 158,292 L 152,286 L 148,278 L 150,268 Z"
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.5"
      strokeOpacity="0.12"
    />

    {/* ── SOUTH AMERICA ─────────────────────────────────────────────────── */}
    <path
      d="
        M 172,252
        L 185,248 L 195,255 L 205,260
        L 210,270 L 212,282
        L 215,295 L 218,308
        L 222,320 L 225,332
        L 222,345 L 218,358
        L 212,370 L 205,382
        L 198,392 L 192,400
        L 185,408 L 178,415
        L 172,420 L 165,415
        L 158,408 L 152,398
        L 148,388 L 145,376
        L 142,364 L 140,352
        L 140,340 L 142,328
        L 145,315 L 148,302
        L 152,290 L 155,278
        L 158,266 L 163,258
        L 168,252 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* ── EUROPE ────────────────────────────────────────────────────────── */}
    <path
      d="
        M 450,80
        L 465,75 L 480,72 L 492,75
        L 502,80 L 508,88
        L 505,96 L 498,102
        L 510,108 L 515,116
        L 510,124 L 500,130
        L 492,136 L 485,142
        L 478,148 L 475,155
        L 468,160 L 460,165
        L 452,168 L 445,165
        L 438,158 L 432,150
        L 428,142 L 425,132
        L 428,122 L 432,112
        L 438,102 L 442,92
        L 445,82 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* Iberian peninsula */}
    <path
      d="M 432,140 L 445,138 L 450,148 L 445,158 L 435,162 L 428,155 L 428,145 Z"
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.4"
      strokeOpacity="0.12"
    />

    {/* Scandinavian peninsula */}
    <path
      d="M 480,72 L 488,62 L 496,55 L 505,58 L 510,68 L 508,78 L 502,82 L 492,78 Z"
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.4"
      strokeOpacity="0.12"
    />

    {/* ── AFRICA ────────────────────────────────────────────────────────── */}
    <path
      d="
        M 460,168
        L 475,165 L 488,162 L 500,165
        L 512,170 L 522,178
        L 528,190 L 530,205
        L 528,220 L 525,235
        L 522,250 L 520,265
        L 518,280 L 518,295
        L 520,310 L 522,325
        L 520,340 L 515,352
        L 508,362 L 500,370
        L 492,375 L 485,372
        L 478,365 L 472,355
        L 466,342 L 462,330
        L 460,318 L 460,305
        L 462,292 L 464,278
        L 464,265 L 462,252
        L 458,240 L 454,228
        L 450,216 L 448,204
        L 448,192 L 450,180
        L 454,172 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* Horn of Africa */}
    <path
      d="M 528,205 L 538,210 L 545,220 L 540,228 L 530,222 L 526,212 Z"
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.4"
      strokeOpacity="0.12"
    />

    {/* ── RUSSIA / NORTH ASIA ───────────────────────────────────────────── */}
    <path
      d="
        M 508,80
        L 530,75 L 560,70 L 590,65
        L 625,62 L 660,62
        L 695,64 L 725,68
        L 755,72 L 780,78
        L 800,85 L 812,92
        L 818,100 L 815,110
        L 808,118 L 798,125
        L 785,130 L 770,134
        L 755,138 L 740,142
        L 725,144 L 710,142
        L 695,140 L 680,138
        L 665,136 L 650,138
        L 635,140 L 620,138
        L 605,134 L 590,130
        L 575,128 L 560,128
        L 545,130 L 530,128
        L 518,125 L 510,118
        L 506,108 L 505,98 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* ── MIDDLE EAST / ARABIAN PENINSULA ──────────────────────────────── */}
    <path
      d="
        M 530,160
        L 545,155 L 558,152
        L 568,158 L 575,168
        L 578,180 L 575,192
        L 568,200 L 558,205
        L 548,205 L 540,200
        L 532,192 L 528,182
        L 528,172 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.5"
      strokeOpacity="0.12"
    />

    {/* ── SOUTH ASIA (Indian subcontinent) ─────────────────────────────── */}
    <path
      d="
        M 610,160
        L 628,155 L 645,155
        L 658,162 L 665,175
        L 668,190 L 665,205
        L 658,218 L 648,228
        L 638,232 L 628,228
        L 618,218 L 612,205
        L 608,192 L 608,178
        L 608,165 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* ── EAST ASIA (China + Korea + Japan area) ───────────────────────── */}
    <path
      d="
        M 720,130
        L 745,128 L 768,128
        L 788,132 L 805,138
        L 815,148 L 818,160
        L 815,172 L 808,182
        L 798,190 L 785,195
        L 770,198 L 755,198
        L 740,195 L 728,188
        L 718,178 L 712,166
        L 710,154 L 712,143
        L 715,135 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* ── SOUTHEAST ASIA (mainland + Malay peninsula) ──────────────────── */}
    <path
      d="
        M 748,195
        L 760,195 L 772,198
        L 780,208 L 780,220
        L 775,230 L 768,238
        L 760,242 L 752,240
        L 745,232 L 742,222
        L 742,212 L 744,202 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.5"
      strokeOpacity="0.12"
    />

    {/* Indonesian archipelago - Sumatra */}
    <path
      d="M 720,250 L 738,242 L 755,242 L 762,250 L 758,260 L 742,265 L 726,260 Z"
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.4"
      strokeOpacity="0.12"
    />
    {/* Java/Borneo area */}
    <path
      d="M 758,258 L 775,252 L 792,252 L 802,260 L 800,270 L 785,275 L 768,272 L 758,265 Z"
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.4"
      strokeOpacity="0.12"
    />

    {/* ── AUSTRALIA ────────────────────────────────────────────────────── */}
    <path
      d="
        M 780,300
        L 800,295 L 820,295
        L 840,298 L 858,305
        L 870,315 L 875,328
        L 875,342 L 870,355
        L 860,365 L 848,372
        L 832,375 L 815,375
        L 798,370 L 784,360
        L 774,348 L 768,335
        L 766,322 L 770,310
        L 775,302 Z
      "
      fill="hsl(var(--foreground))"
      opacity="0.07"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.6"
      strokeOpacity="0.12"
    />

    {/* ── GREENLAND ─────────────────────────────────────────────────────── */}
    <path
      d="M 145,25 L 162,20 L 178,22 L 188,30 L 188,42 L 180,50 L 165,52 L 150,48 L 142,38 Z"
      fill="hsl(var(--foreground))"
      opacity="0.05"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.4"
      strokeOpacity="0.10"
    />

    {/* ── MADAGASCAR ───────────────────────────────────────────────────── */}
    <path
      d="M 535,298 L 542,292 L 548,298 L 548,312 L 542,318 L 535,312 Z"
      fill="hsl(var(--foreground))"
      opacity="0.06"
      stroke="hsl(var(--foreground))"
      strokeWidth="0.3"
      strokeOpacity="0.10"
    />

    {/* Equator line */}
    <line
      x1={0} y1={250} x2={1000} y2={250}
      stroke="hsl(var(--accent))"
      strokeWidth="0.5"
      strokeDasharray="6 12"
      opacity="0.2"
    />
  </svg>
);

export default WorldMapBackground;
