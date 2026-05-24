import { Svg, Rect, G, Text } from '@react-pdf/renderer';
import { C } from './colors';

// SVG Text has a union type in @react-pdf/renderer that makes fontSize ambiguous — cast to resolve
const SvgText = Text as React.ComponentType<{
  x: number; y: number; textAnchor?: string; fill?: string; fontSize?: number; children: string;
}>;

interface Props {
  buckets: number[];
  labels: string[];
  width?: number;
}

export function BarChart({ buckets, labels, width = 460 }: Props) {
  const H = 100;
  const PAD_B = 22;
  const chartH = H - PAD_B;
  const max = Math.max(...buckets, 1);
  const n = buckets.length;
  const barW = Math.min(40, (width - 20) / n - 4);
  const gap = (width - n * barW) / (n + 1);

  return (
    <Svg width={width} height={H} style={{ marginTop: 4, marginBottom: 6 }}>
      {buckets.map((v, i) => {
        const bh = Math.max((v / max) * (chartH - 14), v > 0 ? 5 : 1.5);
        const bx = gap + i * (barW + gap);
        const by = chartH - bh;
        const isLast = i === n - 1;
        return (
          <G key={i}>
            <Rect x={bx} y={by} width={barW} height={bh} rx={5} fill={isLast ? C.ink : C.peach} />
            {v > 0 && (
              <SvgText
                x={bx + barW / 2} y={by - 4}
                textAnchor="middle" fill={isLast ? C.ct : C.inkS} fontSize={8}
              >
                {String(v)}
              </SvgText>
            )}
            <SvgText
              x={bx + barW / 2} y={H - 5}
              textAnchor="middle" fill={C.muted} fontSize={7.5}
            >
              {labels[i]}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
