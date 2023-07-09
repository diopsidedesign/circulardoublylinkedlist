// a circular doubly linked list  
export class WheeList {  
 
   static #Node = function(newData) {  
      this.data = newData;
      [ this.prev, this.next ] = [ null, null ]
   }
 
   #length      = 0     
   #head        = null   
   #tail        = null

   #currentNode = null  // set using the 'activate' method

   // keyProp is commonly: 'name', 'id', 'customer#', etc.
   // WheeList doesn't check or care if each key is unique, but they probably should be
   // because 'get' and 'indexOf' methods will always and only return the first match
   constructor(keyProp) { this.keyProp = keyProp }   


   #initialize(data) {  

      const node = new WheeList.#Node(data);   

      [ node.next,
        node.prev,  
        this.#head,
        this.#tail ] = [ node, node, node, node ]; 

      this.#currentNode = this.#head;
      this.#length += 1
   } 

   #reset() {  
      if (this.size === 1) { 
         this.#length = 0;  
         this.#head   = this.#tail = null 
      }
   }    
 
   #link(node0, node1, node2) { 
      [node0.next, node1.prev] = [node1, node0]; 
      return node2 !== undefined ? this.#link(node1, node2) : this
   }

   #getNodeAndNextAt(index) {
      return this.#getNodeAt(index, true)
   }

   #getNode(keyOrIndex) {
      return this.#getNodeAt(this.indexOf(keyOrIndex))
   }

   #getNodeAt(index, alsoGetNextBool) {
      if (index < 0) return undefined;
      let [n, curr] = [0, this.#head]; 
      while (n !== index)
         [n, curr] = [n+1, curr.next]; 
      return alsoGetNextBool === true ? [ curr, curr.next ] : curr  
   }

   #createAndInsertNode(dataIn, beforeNode, afterNode) {  
      const newNode = new WheeList.#Node(dataIn);  
      this.#link(beforeNode, newNode, afterNode)
      this.#length += 1; 
      return newNode
   }

   #deleteHead() {    
      if (this.size<=1) 
         return this.#reset()   
      this.#head = this.#head.next 
      this.#link(this.#tail, this.#head)
      this.#length -= 1 
   } 

   #deleteTail() {    
      if (this.size<=1)
         return this.#reset() 
      const newTail = this.#tail.prev 
      this.#link(newTail, this.#head)
      this.#tail = newTail
      this.#length -= 1
   }

   #delete(index) {    
      index = this.indexOf(index);  
      if (isNaN(index) || index === null || this.size === 0 || index < 0) {
         throw new Error( 'cannot delete, ' +
            (this.size===0 ? 'list empty' : 'invalid index'));
      } 
      if (index === 0)               return this.#deleteHead();    
      if (this.size <=1)             return this.#reset();     
      if (index >= (this.size - 1))  return this.#deleteTail();

      const [prev, curr] = this.#getNodeAndNextAt(index-1); 
      
      this.#link(prev, curr.next)
      this.#length -= 1     
   } 


   [Symbol.iterator]([node, i, data] = [ this.tail, -1, null ]) {    
      return {
         next: () => ({
            value: (() => {
               [node, i, data] = [node?.next, i+1, node?.next?.data ?? null];
               return [node, i, data]
            })(), 
            done: !node || (i >= this.size)
         })
      } 
   }  



 

   get size()           { return this.#length    }

   get head()           { return this.#head      }
   get tail()           { return this.#tail      }  

   get next()           { return this.#currentNode.next.data }
   get prev()           { return this.#currentNode.prev.data }

   get current()        { return this.#currentNode.data      }
   get currentIndex()   { return this.indexOf(this.#currentNode.data.name) } 

   get keys()           { return this.entries.map( entry => entry[0]) } 
   get values()         { return this.entries.map( entry => entry[1]) }

   get entries() {
      const arr = [];
      for (let [_, i, data] of this)  
         arr.push([data[this.keyProp], data]); 
      return arr
   }

   get(keyOrIndex) {
      if (this.has(keyOrIndex))
         return this.#getNode(keyOrIndex)?.data 
   }

   set(key, newVal) { 
      return this.has(key) ? Reflect.set(this.#getNode(key), 'data', newVal)  :  false 
   } 

   has(keyOrIndex) {
      const k = this.indexOf(keyOrIndex)
      return Number.isInteger(k) && k !== -1
   } 

   add(data, hOrT) {    
      if (this.size === 0)
         return this.#initialize(data);
      const newNode = this.#createAndInsertNode(data, this.#tail, this.#head); 
      if (hOrT=='head') 
         this.#head = newNode  
      else 
         this.#tail = newNode   
   }

   delete(keyOrIndex) {
      if (this.has(keyOrIndex))  
         this.#delete(keyOrIndex) 
   }

   activate(keyOrIndexOrNode) { 
      if (keyOrIndexOrNode instanceof WheeList.#Node && 'data' in keyOrIndexOrNode)  
         this.#currentNode = keyOrIndexOrNode; 
      else if (this.has(keyOrIndexOrNode)) 
         this.#currentNode = this.#getNode(this.indexOf(keyOrIndexOrNode)) 
      return this.current
   } 
 
   insert(index, data) {  
      if (this.size === 0)
         return this.#initialize(data)
      if (!this.isValidIndex(Math.max(index - 1, 0))) 
         throw new Error('invalid index')  
      if (index === 0)
         return this.add(data,'head')
      if (index >= this.size)
         return this.add(data,'tail');
      this.#createAndInsertNode(data, ...this.#getNodeAndNextAt(index-1)) 
   }  

   moveNode(fromIndex, toIndex) {
      if (fromIndex === toIndex) return
      const fromNode = this.#getNodeAt(fromIndex);
      if (!fromNode) return
      this.#link(fromNode.prev, fromNode.next);
      const toNode = this.#getNodeAt(toIndex);
      if (!toNode) return
      this.#link(toNode.prev, fromNode, toNode);
      if (fromNode === this.#head)
         this.#head = fromNode.next 
      if (fromNode === this.#tail)
         this.#tail = fromNode.prev;  
   }

   isValidIndex(i) {
      return Number.isInteger(i) && i >= 0 && i < this.size
   } 

   getKeyAtIndex(i) {
      return Reflect.get(this.#getNodeAt(i), this.keyProp)
   }   
  
   indexOf(key) {
      if (typeof key === 'object' && this.keyProp in key) 
         key = key[this.keyProp] 
      if (this.isValidIndex(key))
         return key;
      let [index, curr] = [-1, this.#head]; 
      while (curr != null && index < this.size) {
         if (key === curr.data[this.keyProp] )
            return ++index;
         [index, curr] = [index + 1, curr.next];
      } 
      return -1
   } 
}
 
 