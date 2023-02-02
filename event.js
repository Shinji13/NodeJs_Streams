class Event{
    event;
    constructor(event={}){
        this.event=event;
    }
    AddEventListener(eventName,callback){
       if(!this.event[eventName]){
           this.event[eventName]=[];
       }
       this.event[eventName].push(callback);
       return this;
    }
    removeListener(eventName, listener) {
        const events = this._events;
        if (events[eventName]) {
          for (let i = events[eventName].length - 1; i >= 0; i--) {
            if (events[eventName][i] === listener) {
              events[eventName].splice(i, 1);
              break;
            }
          }
          if (events[eventName].length === 0)
            delete events[eventName];
        }
        return this;
    }
    emit(eventName,...args){
      let cbs=this.event[eventName]
      for(let i=0;i<cbs.length;i++){
           cbs[i](args);   
      }
      this.event[eventName]=[];
      return this;
    }
    getEvents(){
        for(const [key, value] of Object.entries(this.event)){
            console.log(`key: ${key}, value: ${value}`);
        }     
    }
}
Event.prototype.on=Event.prototype.AddEventListener;
module.exports={Event}