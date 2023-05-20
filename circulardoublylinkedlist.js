export class CircularDoublyLinkedList {  

   // New node constructor
   static #Node = function(newData) {  
      [this.data, this.prev, this.next] = [newData, null, null];  
   }

   #indexCache = {}

   constructor(keyProp) { this.keyProp = keyProp }

   #length =  0;   get size() { return this.#length }  
   #head = null;   get head() { return this.#head   } 
   #tail = null;   get tail() { return this.#tail   }

   #initialize(data) { 
      const node = new CircularDoublyLinkedList.#Node(data);  
      [node.next, node.prev,  // in the beginning, there was only node
      this.#head, this.#tail] = [node, node, node, node];
      this.#incrLength(1);
   } 

   #reset() { 
      if (this.size===1) { // no action needed if size already == 0
         this.#setLength(0);
         [this.#head, this.#tail] = [null, null]
      }
   }  
   // as a func so we chain to the link func below
   #incrLength(num) { this.#setLength(this.size + num) }
   #setLength(newLn) {
      if (newLn !== this.size) {
         this.#length = newLn
         this.#indexCache = {}
      }
   }

   // Configures references for node removal/addition
   #link(node0, node1, node2) {
      [node0.next, node1.prev] = [node1, node0];
      return node2 !== undefined ? this.#link(node1, node2) : this
   } 

   #deleteHead() {  
      if (this.size<=1) { this.#reset(); return }
      this.#head = this.head.next; 
      this.#link(this.tail, this.head).#incrLength(-1);    
   } 

   #deleteTail() {  
      if (this.size<=1) { this.#reset(); return }
      const newTail = this.tail.prev;
      this.#link(newTail, this.head).#incrLength(-1);  
      this.#tail = newTail;  
   } 

   #getNodeAndNextAt(index) { return this.goTo(index, true) }

   // enables 'for...of' iteration
   [Symbol.iterator]([curr, i] = [this.tail, 0]) {  
      return {
         next: () => ({
            value: (() => { [curr, i] = [curr.next, i+1]; return curr })(),
            done:  (() => (i > this.size))()
         })
      } 
   } 

   updateItem(key, newVal) {
      return this.has(key) ?
         Reflect.set(this.getItem(key), 'data', newVal)  :  false 
   } 

   isValidIndex(i) { return Number.isInteger(i) && i >= 0 && i < this.size }

   has(keyOrIndex) { return this.indexOf(keyOrIndex) !== -1 }

   getItemAt(i) { return this.isValidIndex(i) ? this.goTo(i) : undefined }

   getItem(keyOrIndex) { return this.getItemAt(this.indexOf(keyOrIndex)) }

   deleteItem(keyOrIndex) {
      if (this.has(keyOrIndex)) { this.delete(this.indexOf(keyOrIndex)) }
   }
 
   indexOf(key) {
      if (this.#indexCache[key] === undefined) {
         this.#indexCache[key] = this.#indexOf(key)
      }  
      return this.#indexCache[key]
   }
   #indexOf(key) {
      if (this.isValidIndex(key)) { return key }
      let [index, curr] = [-1, this.head];
      while (curr && index < this.size) {
         if (key === Reflect.get(curr.data, this.keyProp)) { return ++index }
         [index, curr] = [index+1, curr.next]
      } 
      return -1;
   }   

   createAndInsertNode(dataIn, beforeNode, afterNode) {
      const newNode = new CircularDoublyLinkedList.#Node(dataIn); 
      this.#link(beforeNode, newNode, afterNode).#incrLength(1);
      return newNode
   }

   add(data, hOrT) {  
      if (this.size === 0) { this.#initialize(data); return }
      const newNode = this.createAndInsertNode(data, this.tail, this.head);
      if (hOrT=='head') { this.#head = newNode }
      else              { this.#tail = newNode }  
   }  

   goTo(index, alsoGetNextBool) {
      if (index < 0) { return undefined }
      let [n, curr] = [0, this.head];
      while (n !== index) { [n, curr] = [n+1, curr.next]; }
      return alsoGetNextBool===true ? [ curr, curr.next ] : curr  
   } 

   insert(index, data) {
      if (this.size === 0) { this.#initialize(data); return }
      if (!this.isValidIndex(Math.max(index-1, 0))) {
         throw new Error('invalid index') 
      }
      if (index === 0)        { this.add(data,'head'); return }
      if (index >= this.size) { this.add(data,'tail'); return }
      this.createAndInsertNode(data, ...this.#getNodeAndNextAt(index-1)) 
   }  

   delete(index) {  
      index = this.indexOf(index);
      if (isNaN(index) || index === null || this.size === 0 || index < 0) {
         throw new Error( 'cannot delete, ' +
            (this.size===0 ? 'list empty' : 'invalid index'));
      }
      if (index === 0)       { this.#deleteHead(); return }   
      if (this.size <=1)     { this.#reset();      return }    
      if (index > this.size) { this.#deleteTail(); return }  
      const [prev, curr] = this.#getNodeAndNextAt(index-1); 
      this.#link(prev, curr.next).#incrLength(-1);    
    }
}
