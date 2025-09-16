// Helpers de validación
const validarCorreoDominios = (correo) => /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo||"");
const validarRUN = (run) => {
  if(!/^[0-9]{7,8}[0-9kK]$/.test(run||"")) return false;
  const body = run.slice(0,-1); let dv = run.slice(-1).toUpperCase();
  let sum=0,m=2; for(let i=body.length-1;i>=0;i--){ sum+=parseInt(body[i])*m; m=m===7?2:m+1; }
  const r = 11 - (sum%11); const dvCalc = r===11?"0": r===10?"K": String(r);
  return dvCalc===dv;
};

// Bootstrap + Constraint Validation API
const applyBootstrapValidation = (form, customChecks=()=>true) => {
  form.addEventListener("submit",(e)=>{
    if(!form.checkValidity() || !customChecks()) { e.preventDefault(); e.stopPropagation(); }
    form.classList.add("was-validated");
  }, false);
};

function initLogin(){
  const form = document.getElementById("formLogin");
  applyBootstrapValidation(form, ()=>{
    const okEmail = validarCorreoDominios(form.correo.value.trim());
    if(!okEmail){ form.correo.setCustomValidity("Dominio no permitido"); } else { form.correo.setCustomValidity(""); }
    const len = form.clave.value.trim().length;
    if(len<4 || len>10){ form.clave.setCustomValidity("Largo inválido"); } else { form.clave.setCustomValidity(""); }
    if(okEmail && len>=4 && len<=10){
      localStorage.setItem("session", JSON.stringify({correo: form.correo.value.trim()}));
      location.href="index.html";
    }
    return okEmail && len>=4 && len<=10;
  });
}

function initRegistro(){
  const reg = document.getElementById("region");
  const com = document.getElementById("comuna");
  // Poblar selects
  App.regiones.forEach(r=> reg.append(new Option(r.nombre, r.nombre)));
  reg.addEventListener("change", ()=>{
    com.innerHTML=""; const r=App.regiones.find(x=>x.nombre===reg.value);
    (r?.comunas||[]).forEach(c=> com.append(new Option(c,c)));
  });
  const form = document.getElementById("formRegistro");
  applyBootstrapValidation(form, ()=>{
    const okRun = validarRUN(form.run.value.trim());
    form.run.setCustomValidity(okRun ? "" : "RUN inválido");
    const okCorreo = validarCorreoDominios(form.correo.value.trim());
    form.correo.setCustomValidity(okCorreo ? "" : "Dominio no permitido");
    const ok = okRun && okCorreo;
    if(ok){
      const usuarios = JSON.parse(localStorage.getItem("usuarios")||"[]");
      usuarios.push(Object.fromEntries(new FormData(form)));
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      alert("Usuario registrado");
      location.href="login.html";
    }
    return ok;
  });
}

function initContacto(){
  const form = document.getElementById("formContacto");
  applyBootstrapValidation(form, ()=>{
    const okCorreo = validarCorreoDominios(form.correo.value.trim());
    form.correo.setCustomValidity(okCorreo ? "" : "Dominio no permitido");
    const ok = okCorreo && form.nombre.value.trim() && form.comentario.value.trim();
    if(ok){
      const mensajes = JSON.parse(localStorage.getItem("mensajes")||"[]");
      mensajes.push(Object.fromEntries(new FormData(form)));
      localStorage.setItem("mensajes", JSON.stringify(mensajes));
      alert("Mensaje enviado");
      form.reset();
      form.classList.remove("was-validated");
    }
    return ok;
  });
}
