const fs=require("fs")
const {Event}=require("./event")
class customStream extends Event{
      constructor({highWaterMark,methods:{_construct,_destroy,_write}}){
          super({drain:[],finish:[],close:[],error:[]})
          this.highWaterMark=highWaterMark
          this.writable=true
          this.closed=false
          this._destroy=_destroy
          this._write=_write
          this.internalBuffer=[]
          this.externalBuffer=[]
          this.byteRead=0
          //this.Constructor(_construct)
      }
      // Constructor(_construct){
      //   if(typeof _construct!=="function"){
      //       throw new Error("_construct must be implemented")
      //   }   
      //   _construct(this)
      // }
      write(chunk){
         if(typeof this._write!=="function"){
               throw new Error("_write must be implemented")
         }
         if(this.writable){
               this.internalBuffer.push(Buffer.from(chunk,"utf-8"))
               this.byteRead+=chunk.length
               console.log(this.internalBuffer);
               if(this.byteRead>=this.highWaterMark){
                  this.writable=false
                  const data=Buffer.concat(this.internalBuffer)
                  this.internalBuffer=[]
                  this.byteRead=0
                  this._write(data,this._onwrite.bind(this))
               }
         } else if(!this.closed){
               this.externalBuffer.push(Buffer.from(chunk,"utf-8"))
         }
         return this.writable;
      }
      _onwrite(error){
         if(error){
             this.emit("error",error)
         } else{
            if(this.externalBuffer.length){
                const data=Buffer.concat(this.externalBuffer)
                this.externalBuffer=[]
                this._write(data,this._onwrite.bind(this))
             } else{
                this.writable=true
                this.emit("drain")
             }
         }
      }
        _final(error){
        if(error){
            this.emit("error",error)
        }
        this.destroy()
        this.emit("finish")
      }
      cleanUp(){
        this.internalBuffer=null
        this.externalBuffer=null
        this.writable=false
        this.closed=true
        this.byteRead=0
      }
      end(chunk){
        if(typeof this._write!=="function"){
            throw new Error("_write must be implemented")
        }  
        if(this.writable) {
            const data=Buffer.concat([...this.internalBuffer,Buffer.from(chunk,"utf-8")])
            this.cleanUp()
            this._write(data,this._final.bind(this))
        }else if(chunk){
            this.AddEventListener("drain",()=>{
              const data=Buffer.from(chunk,"utf-8")
              this.cleanUp()
              this._write(data,this._final.bind(this))
            })
        }
      }
      destroy(){
        if(typeof this._destroy!=="function"){
            throw new Error("_destroy must be implemented")
         }
         this._destroy()
      }
}

let stream=new customStream({highWaterMark:8,methods:{_write:(chunk,onwrite)=>{
     fs.writeFile("stream/test.txt",chunk,{flag:"a"},(err)=>{
        onwrite(err)
     })
}}})
stream.write("goooood byeee my friend ")
stream.write("goooood byeee my friend ")
stream.write("goooood byeee my friend ")
stream.on("drain",()=>{
  console.log("drained");
})
stream.end("see you later")
stream.on("finish",()=>{
  console.log("finished");
})