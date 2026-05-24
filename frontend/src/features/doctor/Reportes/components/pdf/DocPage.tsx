import React from 'react';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { C } from './colors';
import { FONT, FONT_HEADING } from './fonts';

const LOGO = `${typeof window !== 'undefined' ? window.location.origin : ''}/flor.png`;

export const BASE = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    fontFamily: FONT,
    fontSize: 11,
    color: C.ink,
    paddingTop: 48,
    paddingBottom: 48,
  },
  watermark: {
    position: 'absolute',
    top: '33%',
    left: '30%',
    width: 220,
    height: 220,
    opacity: 0.045,
  },
  header: {
    backgroundColor: C.butter,
    paddingHorizontal: 36,
    paddingVertical: 22,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 48,
    height: 48,
    marginRight: 14,
  },
  tag: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.warn,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_HEADING,
    fontSize: 22,
    fontWeight: 700,
    color: C.ink,
    lineHeight: 1.1,
  },
  sub: {
    fontSize: 10,
    color: C.inkS,
    marginTop: 3,
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  metaLogo: {
    width: 28,
    height: 28,
    marginBottom: 6,
    alignSelf: 'flex-end',
    opacity: 0.5,
  },
  metaName: {
    fontSize: 10,
    fontWeight: 700,
    color: C.ink,
    textAlign: 'right',
  },
  metaDate: {
    fontSize: 8.5,
    color: C.muted,
    textAlign: 'right',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sLabel: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: C.muted,
    marginTop: 20,
    marginBottom: 9,
    paddingBottom: 5,
    borderBottomWidth: 0.75,
    borderBottomColor: C.hair,
  },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 1.8,
    borderTopWidth: 0.75,
    borderTopColor: C.hair,
    paddingTop: 8,
  },
});

export { FONT_HEADING };

export function SLabel({ text }: { text: string }) {
  return <Text style={BASE.sLabel}>{text}</Text>;
}

interface DocPageProps {
  size?: 'LETTER' | 'A4' | [number, number];
  orientation?: 'portrait' | 'landscape';
  label: string;
  title: string;
  sub?: string;
  footer: string;
  todayStr: string;
  children: React.ReactNode;
}

export function DocPage({ size = 'LETTER', orientation, label, title, sub, footer, todayStr, children }: DocPageProps) {
  return (
    <Page size={size} orientation={orientation} style={BASE.page}>

      {/* Watermark — fixed so it appears on every page */}
      <Image src={LOGO} fixed style={BASE.watermark} />

      {/* Header band */}
      <View style={BASE.header}>
        <View style={BASE.headerRow}>
          {/* Left: logo + title block */}
          <View style={BASE.headerLeft}>
            <Image src={LOGO} style={BASE.headerLogo} />
            <View>
              <Text style={BASE.tag}>{label}</Text>
              <Text style={BASE.title}>{title}</Text>
              {sub && <Text style={BASE.sub}>{sub}</Text>}
            </View>
          </View>

          {/* Right: clinic name + date */}
          <View style={BASE.metaRight}>
            <Text style={BASE.metaName}>Consultorio Manzanilla</Text>
            <Text style={BASE.metaDate}>{todayStr}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={BASE.body}>
        {children}
      </View>

      {/* Footer — fixed so it appears on every page, absolute so it doesn't push content */}
      <Text fixed style={BASE.footer}>{footer}</Text>
    </Page>
  );
}
