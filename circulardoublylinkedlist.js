export class CircularDoublyLinkedList {  
 
   static #Node = function(newData) {  
      [this.data, this.prev, this.next] = [newData, null, null];  
   }

   #indexCache = {} 
   #length     =  0     
   #head       = null   
   #tail       = null   

   constructor(keyProp) {
      this.keyProp = keyProp
   }

   get size() { return this.#length }
   get head() { return this.#head   }
   get tail() { return this.#tail   }

   #initialize(data) { 

      const node = new CircularDoublyLinkedList.#Node(data);  

      // in the beginning, there was only node
      [node.next, node.prev,  
      this.#head, this.#tail] = [node, node, node, node];

      this.#incrLength(1);
   } 

   #reset() { 
      if (this.size===1) { 
         this.#length = 0;
         this.#indexCache = {}
         [this.#head, this.#tail] = [null, null];
      }
   }   

   #incrLength(num) {
      this.#length = this.#length + num;
      this.#indexCache = {}
   }
 
   #link(node0, node1, node2) {

      [node0.next, node1.prev] = [node1, node0];

      return node2 !== undefined ?
         this.#link(node1, node2)
         : this
   } 

   #deleteHead() {  

      if (this.size<=1)
         return this.#reset() 

      this.#head = this.head.next

      this.#link(this.tail, this.head)
          .#incrLength(-1)
   } 

   #deleteTail() {  

      if (this.size<=1)
         return this.#reset()

      const newTail = this.tail.prev

      this.#link(newTail, this.head)
          .#incrLength(-1)

      this.#tail = newTail
   } 

   #getNodeAndNextAt(index) {
      return this.goTo(index, true)
   }
 
   [Symbol.iterator]([node, i, data] = [ this.tail, -1, null ]) {    
      return {
         next: () => ({
            value: (() => { [node, i, data] = [node.next, i+1, node.next?.data ?? null]; return [node, i, data] })(), 
            done: i >= this.size
         })
      } 
   }  

   asEntries(arr = []) {
      for (let [node, i, data] of this)  
         arr.push([data[this.keyProp], data]); 
      return arr
   }
   
   keys() {
      return this.asEntries().map( entry => entry[0])
   }

   updateItem(key, newVal) { 
      return this.has(key) ? Reflect.set(this.getItem(key), 'data', newVal)  :  false 
   } 

   isValidIndex(i) {
      return Number.isInteger(i) && i >= 0 && i < this.size
   }

   has(keyOrIndex) {
      return this.indexOf(keyOrIndex) !== -1
   }

   getItemAt(i) {
      return this.isValidIndex(i) ? this.goTo(i) : undefined
   }

   getKeyAtIndex(i) {
      return Reflect.get(this.getItemAt(i), this.keyProp)
   }

   getItem(keyOrIndex) {
      return this.getItemAt(this.indexOf(keyOrIndex))
   }

   get(keyOrIndex) {
      return this.getItem(keyOrIndex).data 
   }

   deleteItem(keyOrIndex) {
      if (this.has(keyOrIndex)) { this.delete(this.indexOf(keyOrIndex)) }
   }
 
   indexOf(key) {
      if (this.#indexCache[key] === undefined)  
         this.#indexCache[key] = this.#indexOf(key) 
      return this.#indexCache[key]
   }

   #indexOf(key) {

      if (typeof key === 'object' && this.keyProp in key) 
         key = key[this.keyProp] 
      
      if (this.isValidIndex(key))
         return key  

      let [index, curr] = [-1, this.head];

      while (curr && (index < this.size)) {
         if (key === Reflect.get(curr.data, this.keyProp))
            return ++index;
         [index, curr] = [index+1, curr.next];
      } 
      return -1
   }   

   createAndInsertNode(dataIn, beforeNode, afterNode) {

      const newNode = new CircularDoublyLinkedList.#Node(dataIn); 

      this.#link(beforeNode, newNode, afterNode)
          .#incrLength(1);

      return newNode
   }

   add(data, hOrT) {  

      if (this.size === 0)
         return this.#initialize(data) 

      const newNode = this.createAndInsertNode(data, this.tail, this.head);

      if (hOrT=='head')
         this.#head = newNode 
      else
         this.#tail = newNode  
   }  

   goTo(index, alsoGetNextBool) {

      if (index < 0) return undefined 

      let [n, curr] = [0, this.head];

      while (n !== index)
         [n, curr] = [n+1, curr.next];

      return alsoGetNextBool === true ? [ curr, curr.next ] : curr  
   } 

   insert(index, data) {

      if (this.size === 0)
         return this.#initialize(data)
      if (!this.isValidIndex(Math.max(index-1, 0))) 
         throw new Error('invalid index')  
      if (index === 0)
         return this.add(data,'head')
      if (index >= this.size)
         return this.add(data,'tail') 

      this.createAndInsertNode(data, ...this.#getNodeAndNextAt(index-1)) 
   }  

   delete(index) {  

      index = this.indexOf(index);

      if (isNaN(index) || index === null || this.size === 0 || index < 0) {
         throw new Error( 'cannot delete, ' +
            (this.size===0 ? 'list empty' : 'invalid index'));
      }

      if (index === 0)        return this.#deleteHead()    
      if (this.size <=1)      return this.#reset()           
      if (index > this.size)  return this.#deleteTail()

      const [prev, curr] = this.#getNodeAndNextAt(index-1) 

      this.#link(prev, curr.next)
          .#incrLength(-1)    
    }

   moveNode(fromIndex, toIndex) {

      if (fromIndex === toIndex) return

      const fromNode = this.getItemAt(fromIndex);

      if (!fromNode) return

      this.#link(fromNode.prev, fromNode.next);

      const toNode = this.getItemAt(toIndex);

      if (!toNode) return

      this.#link(toNode.prev, fromNode, toNode);

      if (fromNode === this.head)
         this.#head = fromNode.next 
      if (fromNode === this.tail)
         this.#tail = fromNode.prev; 
   } 
}
 
 