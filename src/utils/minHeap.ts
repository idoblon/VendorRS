export class MinHeap<T> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number = (a: any, b: any) => a - b) {
    this.heap = [];
    this.compare = compare;
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  peek(): T | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  insert(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin(): T | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  toArray(): T[] {
    return [...this.heap];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;

      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      let leftChild = 2 * index + 1;
      let rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < length && this.compare(this.heap[leftChild], this.heap[smallest]) < 0) {
        smallest = leftChild;
      }

      if (rightChild < length && this.compare(this.heap[rightChild], this.heap[smallest]) < 0) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Type for center revenue data
export interface CenterRevenueData {
  centerId: string;
  centerName: string;
  centerLocation: string;
  totalRevenue: number;
  orderCount: number;
  lastOrderDate: string;
  averageOrderValue: number;
}

// Heap-based Top-K algorithm for finding top centers by revenue
export function findTopCentersByRevenue(
  orders: any[],
  centers: any[],
  K: number = 10
): CenterRevenueData[] {
  // Create a map to store revenue data per center
  const centerRevenueMap = new Map<string, CenterRevenueData>();

  // Calculate total revenue per center from orders
  for (const order of orders) {
    if (order.status === 'DELIVERED' || order.status === 'SHIPPED' || order.status === 'CONFIRMED') {
      const centerId = order.centerId;
      const revenue = order.orderSummary?.totalAmount || 0;

      if (centerRevenueMap.has(centerId)) {
        const existing = centerRevenueMap.get(centerId)!;
        existing.totalRevenue += revenue;
        existing.orderCount += 1;
        existing.averageOrderValue = existing.totalRevenue / existing.orderCount;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        // Find center details
        const center = centers.find(c => c._id === centerId);
        if (center) {
          centerRevenueMap.set(centerId, {
            centerId,
            centerName: center.name || center.businessName || 'Unknown Center',
            centerLocation: `${center.address || ''}, ${center.district || ''}`.trim(),
            totalRevenue: revenue,
            orderCount: 1,
            lastOrderDate: order.createdAt,
            averageOrderValue: revenue
          });
        }
      }
    }
  }

  // Use min-heap to track top K centers
  const minHeap = new MinHeap<CenterRevenueData>((a, b) => a.totalRevenue - b.totalRevenue);

  for (const centerData of centerRevenueMap.values()) {
    if (minHeap.size() < K) {
      minHeap.insert(centerData);
    } else if (centerData.totalRevenue > minHeap.peek()!.totalRevenue) {
      minHeap.extractMin();
      minHeap.insert(centerData);
    }
  }

  // Convert to sorted array (descending order by revenue)
  const result = [];
  while (!minHeap.isEmpty()) {
    result.push(minHeap.extractMin()!);
  }

  return result.reverse(); // Reverse to get descending order
}

// New function to find top centers by revenue from admin analytics
export function findTopCentersByRevenueFromAnalytics(
  centersAnalytics: any[],
  K: number = 4
): CenterRevenueData[] {
  if (!centersAnalytics || centersAnalytics.length === 0) {
    return [];
  }

  // Use min-heap to track top K centers by totalRevenue
  const minHeap = new MinHeap<CenterRevenueData>((a, b) => a.totalRevenue - b.totalRevenue);

  for (const center of centersAnalytics) {
    const centerData: CenterRevenueData = {
      centerId: center.centerId,
      centerName: center.centerName || 'Unknown Center',
      centerLocation: center.centerLocation || '',
      totalRevenue: center.totalRevenue || 0,
      orderCount: center.orderCount || 0,
      lastOrderDate: center.lastOrderDate || new Date().toISOString(),
      averageOrderValue: center.averageOrderValue || 0
    };

    if (minHeap.size() < K) {
      minHeap.insert(centerData);
    } else if (centerData.totalRevenue > minHeap.peek()!.totalRevenue) {
      minHeap.extractMin();
      minHeap.insert(centerData);
    }
  }

  // Convert to sorted array (descending order by revenue)
  const result = [];
  while (!minHeap.isEmpty()) {
    result.push(minHeap.extractMin()!);
  }

  return result.reverse(); // Reverse to get descending order
}
