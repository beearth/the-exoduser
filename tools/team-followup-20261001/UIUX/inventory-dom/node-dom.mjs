export function createDocument() {
  const document={};
  class Node {
    constructor(tag='div') {this.tagName=tag.toUpperCase();this.children=[];this.parentElement=null;this.dataset={};this.attrs={};this.style={setProperty(key,value){this[key]=value;}};this.className='';this.clientWidth=400;this.offsetWidth=400;this.clientHeight=200;this.scrollTop=0;this._html='';this.classList={contains:token=>this.className.split(/\s+/).includes(token),add:(...tokens)=>{this.className=[...new Set([...this.className.split(/\s+/),...tokens])].join(' ').trim();},remove:(...tokens)=>{this.className=this.className.split(/\s+/).filter(token=>!tokens.includes(token)).join(' ');},toggle:(token,on)=>on?this.classList.add(token):this.classList.remove(token)};}
    get isConnected(){return this===document.body||!!this.parentElement?.isConnected;}
    append(...nodes){for(const node of nodes){node.remove();node.parentElement=this;this.children.push(node);}}
    appendChild(node){this.append(node);return node;}
    insertBefore(node,before){node.remove();node.parentElement=this;const index=this.children.indexOf(before);this.children.splice(index<0?this.children.length:index,0,node);return node;}
    contains(node){return node===this||this.children.some(child=>child.contains(node));}
    remove(){if(this.contains(document.activeElement))document.activeElement=document.body;if(this.parentElement){this.parentElement.children=this.parentElement.children.filter(node=>node!==this);this.parentElement=null;}}
    replaceChildren(...nodes){for(const child of [...this.children])child.remove();this.append(...nodes);}
    set innerHTML(html){this.replaceChildren();this._html=html;for(const match of html.matchAll(/<button\b([^>]*)>(.*?)<\/button>/gs)){const button=new Node('button');button.textContent=match[2];this.append(button);}}
    get innerHTML(){return this._html;}
    matches(selector){if(selector==='[hidden]')return !!this.hidden;if(selector==='[aria-hidden="true"]')return this.attrs['aria-hidden']==='true';if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));if(selector.startsWith('#'))return this.id===selector.slice(1);return this.tagName.toLowerCase()===selector;}
    closest(selector){if(selector.split(',').some(part=>this.matches(part)))return this;return this.parentElement?.closest(selector)||null;}
    querySelectorAll(selector){const direct=selector.startsWith(':scope > ');const target=direct?selector.slice(9):selector;const found=[];for(const child of this.children){if(child.matches(target))found.push(child);if(!direct)found.push(...child.querySelectorAll(target));}return found;}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    setAttribute(key,value){this.attrs[key]=String(value);}
    removeAttribute(key){delete this.attrs[key];}
    focus(){const computed=document.defaultView.getComputedStyle(this);if(this.isConnected&&!this.disabled&&!this.closest('[hidden]')&&computed.visibility!=='hidden'&&computed.display!=='none')document.activeElement=this;}
    blur(){if(document.activeElement===this)document.activeElement=document.body;}
  }
  document.createElement=tag=>new Node(tag);document.createTextNode=text=>{const node=new Node('text');node.textContent=text;return node;};
  document.body=new Node('body');document.activeElement=document.body;
  document.getElementById=id=>document.body.querySelector('#'+id);
  document.defaultView={getComputedStyle(node){let current=node;let visibility='visible',display='block';while(current){if(current.style.visibility==='hidden')visibility='hidden';if(current.style.display==='none'||current.hidden)display='none';current=current.parentElement;}return {visibility,display,paddingLeft:'0',paddingRight:'0'};}};
  return document;
}
