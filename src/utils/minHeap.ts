export class MinHeap {
  heap: any[];
  compare: (a: any, b: any) => number;

  constructor(compare = (a: any, b: any) => a - b) {
    this.heap = [];
    this.compare = compare;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  insert(value: any) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }

      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// Find top K centers by total revenue
export function findTopCentersByRevenue(orders: any[], centers: any[], K = 4) {
  const centerRevenueMap = new Map<string, any>();

  for (const order of orders) {
    if (['DELIVERED', 'SHIPPED', 'CONFIRMED'].includes(order.status)) {
      const centerId = order.centerId.toString();
      const revenue = order.orderSummary?.totalAmount || 0;

      if (centerRevenueMap.has(centerId)) {
        const existing = centerRevenueMap.get(centerId);
        existing.totalRevenue += revenue;
        existing.orderCount += 1;
        existing.averageOrderValue = existing.totalRevenue / existing.orderCount;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        const center = centers.find((c: any) => c._id.toString() === centerId);
        if (center) {
          centerRevenueMap.set(centerId, {
            centerId,
            centerName: center.name || center.businessName || 'Unknown Center',
            centerLocation: `${center.address || ''}, ${center.district || ''}`.trim(),
            totalRevenue: revenue,
            orderCount: 1,
            lastOrderDate: order.createdAt,
            averageOrderValue: revenue,
          });
        }
      }
    }
  }

  const minHeap = new MinHeap((a, b) => a.totalRevenue - b.totalRevenue);

  for (const data of centerRevenueMap.values()) {
    if (minHeap.size() < K) minHeap.insert(data);
    else if (data.totalRevenue > minHeap.peek().totalRevenue) {
      minHeap.extractMin();
      minHeap.insert(data);
    }
  }

  const result = [];
  while (!minHeap.isEmpty()) result.push(minHeap.extractMin());
  return result.reverse();
}
