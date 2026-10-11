import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Link2, ArrowRightLeft,
  ChevronRight, Binary, ExternalLink, CheckCircle2
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import QueueVisualizer from '../components/ds/QueueVisualizer';
import LinkedListVisualizer from '../components/ds/LinkedListVisualizer';
import SortingVisualizer from '../components/ds/SortingVisualizer';

const REAL_DATA_STRUCTURES = [
  {
    id: 'priority-queue',
    number: 1,
    unit: 'Unit 4',
    title: 'Priority Queue (Min-Heap)',
    subtitle: 'Upcoming Deadlines & Urgency Scheduling',
    description: 'Models batch assignment and lab deadlines as a complete binary min-heap. Guarantees O(1) peek time for the earliest deliverable and O(log n) dynamic insertions when new posts are published.',
    icon: Layers,
    color: '#f59e0b',
    featureRoute: '/',
    featureLabel: 'Live on Homepage (Upcoming Deadlines Banner)',
    realUsage: 'Powers useUpcomingDeadlines() hook and the urgency countdown banner. Finds the next urgent assignment in O(1) time without sorting the entire post database.',
  },
  {
    id: 'linked-list',
    number: 2,
    unit: 'Unit 3',
    title: 'Doubly Linked List',
    subtitle: 'Post Feed & Prev/Next Pointer Navigation',
    description: 'Represents the active post sequence as a bidirectional chain of DLLNodes with .prev and .next memory pointers, eliminating O(n) array lookups.',
    icon: Link2,
    color: '#a855f7',
    featureRoute: '/',
    featureLabel: 'Live on Post Detail View (/post/:id)',
    realUsage: 'Powers post-to-post sequential navigation on PostPage.jsx. Students hop directly between previous and next posts via memory pointers in O(1) time.',
  },
  {
    id: 'sorting',
    number: 3,
    unit: 'Unit 2',
    title: 'Sorting Algorithms',
    subtitle: 'Archive Event Discovery & Benchmarking',
    description: 'Hand-written implementations of Bubble, Selection, Insertion, Merge, and Quick Sort running on live batch records with real-time comparison and swap telemetry.',
    icon: ArrowRightLeft,
    color: '#3b82f6',
    featureRoute: '/archive',
    featureLabel: 'Live on Archive Page (/archive Sort Bar)',
    realUsage: 'Powers the FDS algorithm selector in ArchiveSortBar.jsx. Replaces black-box browser sorts so students can inspect exact comparisons and swaps on real batch posts.',
  },
];

export default function DSShowcasePage() {
  const [activeTab, setActiveTab] = useState('priority-queue');

  const currentItem = useMemo(
    () => REAL_DATA_STRUCTURES.find((p) => p.id === activeTab),
    [activeTab]
  );

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />

      {/* Hero Section */}
      <section className="relative border-b border-[var(--color-border)] overflow-hidden">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-8 sm:py-12">
          <div className="flex items-center gap-2 mb-3">
            <Binary size={14} className="text-[var(--color-amber)]" />
            <span className="text-[var(--text-xs)] tracking-[0.12em] uppercase text-[var(--color-text-dim)] font-medium">
              Fundamentals of Data Structures · Course Project
            </span>
          </div>
          <h1 className="font-display text-[var(--text-3xl)] sm:text-[var(--text-4xl)] font-semibold tracking-[-0.02em] leading-tight mb-2">
            Data Structures Really Used in
            <span className="text-[var(--color-amber)]"> BatchHub</span>
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            Rather than shoehorning textbook concepts that don’t fit a batch management system, BatchHub focuses exclusively on the <strong>3 data structures that genuinely power production workflows</strong>. Inspect their implementations, complexity metrics, and live in-app behaviors below.
          </p>
        </div>
        <div className="grain-overlay" />
      </section>

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — Structures Navigation */}
          <nav className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-20">
              <p className="text-[var(--text-xs)] tracking-[0.1em] uppercase text-[var(--color-text-dim)] mb-3 font-medium">
                Active In BatchHub
              </p>

              <div className="flex flex-col gap-1 border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
                {REAL_DATA_STRUCTURES.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left p-3 transition-colors flex items-start gap-3 border ${
                        isActive
                          ? 'bg-[var(--color-surface-2)] border-[var(--color-amber)] text-[var(--color-text)] shadow-sm'
                          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                      }`}
                    >
                      <div
                        className="w-8 h-8 shrink-0 flex items-center justify-center border mt-0.5"
                        style={{
                          borderColor: isActive ? 'var(--color-amber)' : 'var(--color-border)',
                          backgroundColor: isActive ? 'var(--color-amber-glow)' : 'transparent',
                          color: isActive ? 'var(--color-amber)' : 'inherit',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono text-[var(--color-text-dim)] uppercase tracking-wider">
                            {item.unit}
                          </span>
                          <span className="text-[10px] text-[var(--color-border)]">·</span>
                          <span className="text-[10px] font-mono text-[var(--color-amber)]">
                            #{item.number}
                          </span>
                        </div>
                        <p className="text-[var(--text-xs)] font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-dim)] truncate">
                          {item.subtitle}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`shrink-0 mt-2 transition-transform ${
                          isActive ? 'text-[var(--color-amber)] translate-x-0.5' : 'text-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Integrity Note */}
              <div className="mt-4 p-3 border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--text-xs)] text-[var(--color-text-dim)] leading-relaxed">
                <div className="flex items-center gap-1.5 text-[var(--color-amber)] font-medium mb-1">
                  <CheckCircle2 size={13} />
                  <span>Engineering Integrity</span>
                </div>
                No artificial fillers. Only data structures with real, verifiable call sites in BatchHub’s codebase are featured here.
              </div>
            </div>
          </nav>

          {/* Main Visualizer Area */}
          <main className="flex-1 min-w-0">
            {/* Header info for active structure */}
            <div className="mb-6 p-4 sm:p-5 border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border"
                  style={{
                    borderColor: 'var(--color-amber)',
                    color: 'var(--color-amber)',
                    backgroundColor: 'var(--color-amber-glow)',
                  }}
                >
                  {currentItem?.unit} · IMPLEMENTATION #{currentItem?.number}
                </span>

                {currentItem?.featureRoute && (
                  <Link
                    to={currentItem.featureRoute}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-amber)] hover:underline border border-[var(--color-amber)]/40 px-2 py-0.5 bg-[var(--color-amber-glow)]/20"
                  >
                    <span>{currentItem.featureLabel}</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>

              <h2 className="font-display text-[var(--text-xl)] sm:text-[var(--text-2xl)] font-semibold tracking-[-0.01em]">
                {currentItem?.title}
              </h2>
              <p className="text-[var(--text-xs)] text-[var(--color-text-dim)] font-medium mt-0.5">
                {currentItem?.subtitle}
              </p>
              <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-2 leading-relaxed">
                {currentItem?.description}
              </p>

              {/* Real In-App Usage Callout */}
              <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-start gap-2 text-[var(--text-xs)] text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-amber)] shrink-0">Real BatchHub Usage:</span>
                <span>{currentItem?.realUsage}</span>
              </div>
            </div>

            {/* Tab Visualizer Body */}
            <div className="animate-fade-in" key={activeTab}>
              {activeTab === 'priority-queue' && <QueueVisualizer />}
              {activeTab === 'linked-list' && <LinkedListVisualizer />}
              {activeTab === 'sorting' && <SortingVisualizer />}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
