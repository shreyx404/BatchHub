import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPLEXITY_TABLE,
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  binarySearch,
  linearSearch,
  SparseMatrix,
  SinglyLinkedList,
  DoublyLinkedList,
  CircularLinkedList,
  Stack,
  infixToPostfix,
  evaluatePostfix,
  Queue,
  CircularQueue,
  MinHeap,
  BST,
  ExpressionTree,
  Graph,
  buildSubjectGraph,
} from '../../src/lib/ds/index.js';

describe('Fundamentals of Data Structures — Core Implementations', () => {

  describe('Unit 1: Complexity Metadata', () => {
    it('should have accurate Big-O complexity records for all syllabus algorithms', () => {
      assert.equal(COMPLEXITY_TABLE['Bubble Sort'].worst, 'O(n²)');
      assert.equal(COMPLEXITY_TABLE['Quick Sort'].average, 'O(n log n)');
      assert.equal(COMPLEXITY_TABLE['Binary Search'].worst, 'O(log n)');
      assert.equal(COMPLEXITY_TABLE['Linear Search'].worst, 'O(n)');
    });
  });

  describe('Unit 2: Searching, Sorting & Sparse Matrix', () => {
    const unsorted = [64, 34, 25, 12, 22, 11, 90];
    const expected = [11, 12, 22, 25, 34, 64, 90];

    it('bubbleSort should correctly sort array and track comparisons', () => {
      const res = bubbleSort([...unsorted]);
      assert.deepEqual(res.sorted, expected);
      assert.ok(res.comparisons > 0);
    });

    it('selectionSort should correctly sort array', () => {
      const res = selectionSort([...unsorted]);
      assert.deepEqual(res.sorted, expected);
      assert.ok(res.swaps > 0);
    });

    it('insertionSort should correctly sort array', () => {
      const res = insertionSort([...unsorted]);
      assert.deepEqual(res.sorted, expected);
    });

    it('mergeSort should correctly sort array in O(n log n)', () => {
      const res = mergeSort([...unsorted]);
      assert.deepEqual(res.sorted, expected);
    });

    it('quickSort should correctly sort array', () => {
      const res = quickSort([...unsorted]);
      assert.deepEqual(res.sorted, expected);
    });

    it('binarySearch should find target in O(log n) steps', () => {
      const res = binarySearch(expected, 25);
      assert.equal(res.found, true);
      assert.equal(res.index, 3);
      assert.ok(res.steps.length <= 4); // log2(7) ceil is 3-4
    });

    it('linearSearch should search sequentially', () => {
      const res = linearSearch(expected, 25);
      assert.equal(res.found, true);
      assert.equal(res.index, 3);
    });

    it('SparseMatrix should store coordinates and transpose properly', () => {
      const sm = new SparseMatrix(3, 4);
      sm.set(0, 1, 5);
      sm.set(2, 3, 9);
      assert.equal(sm.get(0, 1), 5);
      assert.equal(sm.get(0, 0), 0);
      assert.equal(sm.nonZeroCount, 2);

      const trans = sm.transpose();
      assert.equal(trans.rows, 4);
      assert.equal(trans.cols, 3);
      assert.equal(trans.get(1, 0), 5);
      assert.equal(trans.get(3, 2), 9);
    });
  });

  describe('Unit 3: Linked Lists', () => {
    it('SinglyLinkedList should append, prepend, insertAt, deleteAt', () => {
      const sll = new SinglyLinkedList();
      sll.append(10);
      sll.prepend(5);
      sll.append(20);
      sll.insertAt(1, 7); // [5, 7, 10, 20]
      assert.deepEqual(sll.toArray(), [5, 7, 10, 20]);
      assert.equal(sll.deleteAt(1), 7);
      assert.deepEqual(sll.toArray(), [5, 10, 20]);
    });

    it('DoublyLinkedList should navigate bidirectionally and delete', () => {
      const dll = new DoublyLinkedList();
      dll.append('A');
      dll.append('B');
      dll.append('C');
      assert.equal(dll.current, 'A');
      assert.equal(dll.next(), 'B');
      assert.equal(dll.next(), 'C');
      assert.equal(dll.prev(), 'B');
      assert.equal(dll.deleteAt(1), 'B');
      assert.deepEqual(dll.toArray(), ['A', 'C']);
    });

    it('CircularLinkedList should rotate in a ring buffer', () => {
      const cll = new CircularLinkedList();
      cll.append(1);
      cll.append(2);
      cll.append(3);
      assert.equal(cll.current, 1);
      assert.equal(cll.rotate(), 2);
      assert.equal(cll.rotate(), 3);
      assert.equal(cll.rotate(), 1); // Loops back to head
    });
  });

  describe('Unit 4: Stacks & Queues', () => {
    it('Stack should obey LIFO principle', () => {
      const s = new Stack();
      s.push(10);
      s.push(20);
      assert.equal(s.peek(), 20);
      assert.equal(s.pop(), 20);
      assert.equal(s.pop(), 10);
      assert.equal(s.isEmpty(), true);
    });

    it('infixToPostfix & evaluatePostfix should parse expressions via stack', () => {
      const { postfix } = infixToPostfix('(3 + 4) * 2');
      assert.equal(postfix.trim(), '3 4 + 2 *');
      const { result } = evaluatePostfix(postfix);
      assert.equal(result, 14);
    });

    it('Queue should obey FIFO principle', () => {
      const q = new Queue();
      q.enqueue('first');
      q.enqueue('second');
      assert.equal(q.front(), 'first');
      assert.equal(q.dequeue(), 'first');
      assert.equal(q.dequeue(), 'second');
      assert.equal(q.isEmpty(), true);
    });

    it('CircularQueue should wrap around modulo capacity', () => {
      const cq = new CircularQueue(3);
      cq.enqueue(1);
      cq.enqueue(2);
      cq.enqueue(3);
      assert.equal(cq.isFull(), true);
      assert.equal(cq.dequeue(), 1);
      cq.enqueue(4); // Wrap-around insertion
      assert.deepEqual(cq.toArray(), [2, 3, 4]);
    });

    it('MinHeap should extract minimum element at all times', () => {
      const heap = new MinHeap();
      heap.insert(40);
      heap.insert(10);
      heap.insert(30);
      heap.insert(5);
      assert.equal(heap.peek(), 5);
      assert.equal(heap.extractMin(), 5);
      assert.equal(heap.extractMin(), 10);
      assert.equal(heap.extractMin(), 30);
      assert.equal(heap.extractMin(), 40);
    });
  });

  describe('Unit 5: Trees', () => {
    it('BST should maintain binary search invariant and support traversals', () => {
      const bst = new BST();
      [50, 30, 70, 20, 40, 60, 80].forEach(v => bst.insert(v));
      assert.equal(bst.search(40).found, true);
      assert.equal(bst.search(99).found, false);
      assert.equal(bst.min(), 20);
      assert.equal(bst.max(), 80);

      // In-order traversal must be sorted
      const inOrder = bst.inOrder().values;
      assert.deepEqual(inOrder, [20, 30, 40, 50, 60, 70, 80]);

      // Range query
      const range = bst.rangeQuery(30, 60);
      assert.deepEqual(range, [30, 40, 50, 60]);

      // Deletion of node with 2 children
      bst.delete(30);
      assert.deepEqual(bst.inOrder().values, [20, 40, 50, 60, 70, 80]);
    });

    it('ExpressionTree should build from postfix tokens and evaluate', () => {
      const tokens = ['3', '4', '+', '2', '*'];
      const { tree } = ExpressionTree.fromPostfix(tokens);
      assert.equal(tree.evaluate().result, 14);
      assert.equal(tree.toInfix(), '((3 + 4) * 2)');
    });
  });

  describe('Unit 6: Graphs', () => {
    it('Graph should compute BFS, DFS, and shortest path', () => {
      const g = new Graph(false);
      g.addEdge('A', 'B');
      g.addEdge('A', 'C');
      g.addEdge('B', 'D');
      g.addEdge('C', 'D');
      g.addEdge('D', 'E');

      const bfsRes = g.bfs('A');
      assert.equal(bfsRes.visited[0], 'A');
      assert.equal(bfsRes.visited.length, 5);

      const dfsRes = g.dfs('A');
      assert.equal(dfsRes.visited[0], 'A');
      assert.equal(dfsRes.visited.length, 5);

      const sp = g.shortestPath('A', 'E');
      assert.equal(sp.distance, 3);
      assert.equal(sp.path[0], 'A');
      assert.equal(sp.path[sp.path.length - 1], 'E');
    });

    it('Graph should compute topological sort on DAGs', () => {
      const dag = new Graph(true);
      dag.addEdge('FDS', 'OS');
      dag.addEdge('OS', 'AI');
      const { order } = dag.topologicalSort();
      assert.ok(order.indexOf('FDS') < order.indexOf('OS'));
      assert.ok(order.indexOf('OS') < order.indexOf('AI'));
    });

    it('buildSubjectGraph should connect subjects sharing tags', () => {
      const subjects = [{ id: 's1', name: 'FDS' }, { id: 's2', name: 'OS' }];
      const posts = [
        { subject_id: 's1', tags: ['lab', 'exam'] },
        { subject_id: 's2', tags: ['lab'] },
      ];
      const g = buildSubjectGraph(subjects, posts);
      assert.deepEqual(g.getNeighbors('s1'), ['s2']);
    });
  });
});
