import { useState, useMemo } from 'react';
import {
  BarChart3, Search, Link2, Layers, ArrowRightLeft,
  TreePine, GitBranch, ChevronRight, Binary, Boxes
} from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ComplexityChart from '../components/ds/ComplexityChart';
import SortingVisualizer from '../components/ds/SortingVisualizer';
import BinarySearchVisualizer from '../components/ds/BinarySearchVisualizer';
import SparseMatrixVisualizer from '../components/ds/SparseMatrixVisualizer';
import LinkedListVisualizer from '../components/ds/LinkedListVisualizer';
import StackVisualizer from '../components/ds/StackVisualizer';
import QueueVisualizer from '../components/ds/QueueVisualizer';
import BSTVisualizer from '../components/ds/BSTVisualizer';
import ExpressionTreeVisualizer from '../components/ds/ExpressionTreeVisualizer';
import GraphVisualizer from '../components/ds/GraphVisualizer';

const UNITS = [
  {
    id: 'unit-1',
    number: 1,
    title: 'Complexity Analysis',
    subtitle: 'Big-O, Big-Ω, Big-Θ Notation',
    icon: BarChart3,
    color: '#10b981',
  },
  {
    id: 'unit-2',
    number: 2,
    title: 'Arrays, Searching & Sorting',
    subtitle: 'Bubble, Selection, Insertion, Merge, Quick Sort',
    icon: ArrowRightLeft,
    color: '#3b82f6',
  },
  {
    id: 'unit-3',
    number: 3,
    title: 'Linked Lists',
    subtitle: 'Singly, Doubly & Circular',
    icon: Link2,
    color: '#a855f7',
  },
  {
    id: 'unit-4',
    number: 4,
    title: 'Stacks & Queues',
    subtitle: 'Stack, Queue, Circular Queue, Priority Queue, Deque',
    icon: Layers,
    color: '#f59e0b',
  },
  {
    id: 'unit-5',
    number: 5,
    title: 'Trees',
    subtitle: 'BST, Traversals & Expression Trees',
    icon: TreePine,
    color: '#ec4899',
  },
  {
    id: 'unit-6',
    number: 6,
    title: 'Graphs',
    subtitle: 'BFS, DFS & Topological Sort',
    icon: GitBranch,
    color: '#06b6d4',
  },
];

export default function DSShowcasePage() {
  const [activeUnit, setActiveUnit] = useState('unit-1');

  const currentUnit = useMemo(
    () => UNITS.find((u) => u.id === activeUnit),
    [activeUnit]
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
              Fundamentals of Data Structures
            </span>
          </div>
          <h1 className="font-display text-[var(--text-3xl)] sm:text-[var(--text-4xl)] font-semibold tracking-[-0.02em] leading-tight mb-2">
            Data Structures
            <span className="text-[var(--color-amber)]"> Showcase</span>
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] max-w-xl leading-relaxed">
            Interactive visualizations of every data structure powering BatchHub — mapped directly to the FDS syllabus.
            Each structure is implemented from scratch and integrated into real features.
          </p>
        </div>
        {/* Subtle grain overlay */}
        <div className="grain-overlay" />
      </section>

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — Unit Navigation */}
          <nav className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-20">
              <p className="text-[var(--text-xs)] tracking-[0.1em] uppercase text-[var(--color-text-dim)] mb-3 font-medium">
                Syllabus Units
              </p>
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible scrollbar-hide pb-2 lg:pb-0">
                {UNITS.map((unit) => {
                  const isActive = activeUnit === unit.id;
                  const Icon = unit.icon;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setActiveUnit(unit.id)}
                      className={`group flex items-center gap-2.5 px-3 py-2.5 text-left transition-all whitespace-nowrap lg:whitespace-normal w-full border ${
                        isActive
                          ? 'bg-[var(--color-surface-2)] border-[var(--color-border-light)] text-[var(--color-text)]'
                          : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]'
                      }`}
                    >
                      <div
                        className="w-6 h-6 flex items-center justify-center shrink-0 transition-colors"
                        style={{ color: isActive ? unit.color : undefined }}
                      >
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[var(--text-xs)] font-medium leading-tight">
                          Unit {unit.number}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-dim)] leading-tight hidden lg:block truncate">
                          {unit.title}
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

          {/* Main Content — Visualizer Area */}
          <main className="flex-1 min-w-0">
            {/* Unit Header */}
            <div className="mb-6 pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[var(--text-xs)] font-mono font-bold"
                  style={{ color: currentUnit?.color }}
                >
                  UNIT {currentUnit?.number}
                </span>
              </div>
              <h2 className="font-display text-[var(--text-xl)] sm:text-[var(--text-2xl)] font-semibold tracking-[-0.01em]">
                {currentUnit?.title}
              </h2>
              <p className="text-[var(--text-sm)] text-[var(--color-text-dim)] mt-0.5">
                {currentUnit?.subtitle}
              </p>
            </div>

            {/* Visualizer Content */}
            <div className="animate-fade-in" key={activeUnit}>
              {activeUnit === 'unit-1' && <ComplexityChart />}
              {activeUnit === 'unit-2' && (
                <div className="space-y-8">
                  <SortingVisualizer />
                  <div className="section-divider" />
                  <BinarySearchVisualizer />
                  <div className="section-divider" />
                  <SparseMatrixVisualizer />
                </div>
              )}
              {activeUnit === 'unit-3' && <LinkedListVisualizer />}
              {activeUnit === 'unit-4' && (
                <div className="space-y-8">
                  <StackVisualizer />
                  <div className="section-divider" />
                  <QueueVisualizer />
                </div>
              )}
              {activeUnit === 'unit-5' && (
                <div className="space-y-8">
                  <BSTVisualizer />
                  <div className="section-divider" />
                  <ExpressionTreeVisualizer />
                </div>
              )}
              {activeUnit === 'unit-6' && <GraphVisualizer />}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
