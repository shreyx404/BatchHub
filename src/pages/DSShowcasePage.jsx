import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Link2, ArrowRightLeft, GitBranch,
  BarChart3, ChevronRight, Binary, ExternalLink
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import QueueVisualizer from '../components/ds/QueueVisualizer';
import LinkedListVisualizer from '../components/ds/LinkedListVisualizer';
import SortingVisualizer from '../components/ds/SortingVisualizer';
import BinarySearchVisualizer from '../components/ds/BinarySearchVisualizer';
import GraphVisualizer from '../components/ds/GraphVisualizer';
import ComplexityChart from '../components/ds/ComplexityChart';

const CORE_PILLARS = [
  {
    id: 'priority-queue',
    number: 1,
    unit: 'Unit 4',
    title: 'Priority Queue (Min-Heap)',
    subtitle: 'Upcoming Deadlines & Urgency Scheduling',
    description: 'Models assignment and lab deadlines as a complete binary min-heap. Guarantees O(1) peek time for the earliest deliverable and O(log n) dynamic insertions.',
    icon: Layers,
    color: '#f59e0b',
    featureRoute: '/',
    featureLabel: 'Live on Homepage (Upcoming Deadlines Banner)',
  },
  {
    id: 'linked-list',
    number: 2,
    unit: 'Unit 3',
    title: 'Doubly Linked List',
    subtitle: 'Post Feed & Prev/Next Pointer Navigation',
    description: 'Represents the active post sequence as a bidirectional chain of DLLNodes with .prev and .next memory pointers, eliminating O(n) array searching.',
    icon: Link2,
    color: '#a855f7',
    featureRoute: '/archive',
    featureLabel: 'Live on Post Detail View (/post/:id)',
  },
  {
    id: 'sorting-search',
    number: 3,
    unit: 'Unit 2',
    title: 'Sorting & Binary Search',
    subtitle: 'Archive Event Discovery & Benchmarking',
    description: 'Hand-written implementations of Bubble, Selection, Insertion, Merge, and Quick Sort, plus divide-and-conquer Binary Search with live comparison telemetry.',
    icon: ArrowRightLeft,
    color: '#3b82f6',
    featureRoute: '/archive',
    featureLabel: 'Live on Archive Page (/archive Sort Bar)',
  },
  {
    id: 'curriculum-graph',
    number: 4,
    unit: 'Unit 6',
    title: 'Curriculum Knowledge Graph',
    subtitle: 'Subject Relationships & BFS Traversal',
    description: 'Adjacency List graph where college subjects are vertices connected by shared academic tags and curriculum prerequisites, explored via Breadth-First Search.',
    icon: GitBranch,
    color: '#06b6d4',
    featureRoute: '/notes',
    featureLabel: 'Live on Notes & Subject Network',
  },
  {
    id: 'complexity',
    number: 5,
    unit: 'Unit 1',
    title: 'Complexity Analysis (Big-O)',
    subtitle: 'Theoretical Foundations & Growth Curves',
    description: 'Comparative mathematical growth analysis comparing O(1), O(log n), O(n), O(n log n), O(n²), and O(2ⁿ) with interactive input size scaling.',
    icon: BarChart3,
    color: '#10b981',
    featureRoute: null,
    featureLabel: 'Algorithmic Reference',
  },
];

export default function DSShowcasePage() {
  const [activeTab, setActiveTab] = useState('priority-queue');

  const currentPillar = useMemo(
    () => CORE_PILLARS.find((p) => p.id === activeTab),
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
            Core Data Structures in
            <span className="text-[var(--color-amber)]"> BatchHub</span>
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
            BatchHub integrates hand-written, pure JavaScript data structures into real user workflows.
            Explore the 4 core pillars below to inspect how each structure solves computational problems in our college batch gallery.
          </p>
        </div>
        <div className="grain-overlay" />
      </section>

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — Pillars Navigation */}
          <nav className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-20">
              <p className="text-[var(--text-xs)] tracking-[0.1em] uppercase text-[var(--color-text-dim)] mb-3 font-medium">
                Core DS Pillars
              </p>
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-2 lg:pb-0">
                {CORE_PILLARS.map((pillar) => {
                  const isActive = activeTab === pillar.id;
                  const Icon = pillar.icon;
                  return (
                    <button
                      key={pillar.id}
                      onClick={() => setActiveTab(pillar.id)}
                      className={`group flex items-center gap-2.5 px-3 py-2.5 text-left transition-all whitespace-nowrap lg:whitespace-normal w-full border ${
                        isActive
                          ? 'bg-[var(--color-surface-2)] border-[var(--color-border-light)] text-[var(--color-text)]'
                          : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      <div
                        className="w-6 h-6 flex items-center justify-center shrink-0 transition-colors"
                        style={{ color: isActive ? pillar.color : undefined }}
                      >
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-[var(--color-text-dim)]">{pillar.unit}</span>
                          <span className="text-[var(--text-xs)] font-medium leading-tight truncate">
                            {pillar.title}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--color-text-dim)] leading-tight hidden lg:block truncate mt-0.5">
                          {pillar.subtitle}
                        </div>
                      </div>
                      {isActive && (
                        <ChevronRight size={12} className="ml-auto shrink-0 hidden lg:block text-[var(--color-text-dim)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content — Visualizer Viewport */}
          <main className="flex-1 min-w-0">
            {/* Pillar Header Card */}
            <div className="mb-6 p-4 sm:p-5 bg-[var(--color-surface)] border border-[var(--color-border)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span
                  className="text-[var(--text-xs)] font-mono font-bold tracking-wider"
                  style={{ color: currentPillar?.color }}
                >
                  {currentPillar?.unit} · PILLAR #{currentPillar?.number}
                </span>

                {currentPillar?.featureRoute && (
                  <Link
                    to={currentPillar.featureRoute}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-amber)] hover:underline border border-[var(--color-amber)]/40 px-2 py-0.5 bg-[var(--color-amber-glow)]/20"
                  >
                    <span>{currentPillar.featureLabel}</span>
                    <ExternalLink size={11} />
                  </Link>
                )}
              </div>

              <h2 className="font-display text-[var(--text-xl)] sm:text-[var(--text-2xl)] font-semibold tracking-[-0.01em]">
                {currentPillar?.title}
              </h2>
              <p className="text-[var(--text-xs)] text-[var(--color-text-dim)] font-medium mt-0.5">
                {currentPillar?.subtitle}
              </p>
              <p className="text-[var(--text-xs)] text-[var(--color-text-muted)] mt-2 leading-relaxed">
                {currentPillar?.description}
              </p>
            </div>

            {/* Tab Visualizer Body */}
            <div className="animate-fade-in" key={activeTab}>
              {activeTab === 'priority-queue' && <QueueVisualizer />}
              {activeTab === 'linked-list' && <LinkedListVisualizer />}
              {activeTab === 'sorting-search' && (
                <div className="space-y-8">
                  <SortingVisualizer />
                  <div className="section-divider" />
                  <BinarySearchVisualizer />
                </div>
              )}
              {activeTab === 'curriculum-graph' && <GraphVisualizer />}
              {activeTab === 'complexity' && <ComplexityChart />}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
