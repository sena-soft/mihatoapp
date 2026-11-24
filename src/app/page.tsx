"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Beef, Calculator, ChartNoAxesCombined, CircleHelp, CloudOff, Download, Home, Plus, Scale, ShieldCheck, Sprout, Upload, Users } from "lucide-react";
import { db, type Animal, type WeightRecord } from "@/db/database";
import { calculateWeight, type WeightMethod } from "@/features/weight-calculator/calculator";

type Section = "inicio" | "calculadora" | "ganado" | "historial";
export default function HomePage() {
  const [section, setSection] = useState<Section>("inicio");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [method, setMethod] = useState<WeightMethod>("body-measurements");
  const [girth, setGirth] = useState("");
  const [length, setLength] = useState("");
  const [tapeWeight, setTapeWeight] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [animalLabel, setAnimalLabel] = useState("");
  const [selectedAnimalId, setSelectedAnimalId] = useState("");
  const [tag, setTag] = useState("");
  const [animalName, setAnimalName] = useState("");
  const [breed, setBreed] = useState("Cruza");
  const [sex, setSex] = useState<"Macho" | "Hembra">("Macho");

  async function refresh() {
    const [a, r] = await Promise.all([
      db.animals.orderBy("createdAt").reverse().toArray(),
      db.weightRecords.orderBy("measuredAt").reverse().toArray()
    ]);
    setAnimals(a); setRecords(r); setReady(true);
  }
  useEffect(() => { refresh().catch(() => setReady(true)); }, []);

  const latestWeight = records[0]?.weight;
  const average = records.length ? records.reduce((sum, item) => sum + item.weight, 0) / records.length : 0;
  const selectedAnimal = animals.find(a => String(a.id) === selectedAnimalId);

  function calculate() {
    setError(""); setResult(null);
    try {
      const calculation = method === "bovinometric-tape"
        ? calculateWeight({ method, tapeWeight: Number(tapeWeight) })
        : calculateWeight({ method, heartGirth: Number(girth), bodyLength: Number(length) });
      setResult(calculation.estimatedWeight);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo calcular."); }
  }
  async function saveMeasurement() {
    if (result === null) return;
    const animal = selectedAnimal;
    await db.weightRecords.add({
      animalId: animal?.id,
      animalLabel: animal ? `${animal.earTag} · ${animal.name}` : animalLabel.trim() || "Sin identificar",
      weight: result, method,
      ...(method === "body-measurements" ? { heartGirth: Number(girth), bodyLength: Number(length) } : {}),
      measuredAt: new Date()
    });
    setResult(null); setGirth(""); setLength(""); setTapeWeight(""); setAnimalLabel("");
    await refresh(); setSection("historial");
  }
  async function addAnimal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tag.trim() || !animalName.trim()) return;
    await db.animals.add({ earTag: tag.trim(), name: animalName.trim(), breed, sex, createdAt: new Date() });
    setTag(""); setAnimalName(""); await refresh();
  }
  async function exportBackup() {
    const payload = { app: "MiHatoApp", version: 1, exportedAt: new Date().toISOString(), animals, records };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `mihatoapp-respaldo-${new Date().toISOString().slice(0,10)}.json`;
    link.click(); URL.revokeObjectURL(url);
  }
  async function importBackup(file?: File) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed.app !== "MiHatoApp" || !Array.isArray(parsed.animals) || !Array.isArray(parsed.records)) throw new Error();
      await db.transaction("rw", db.animals, db.weightRecords, async () => {
        await db.animals.clear(); await db.weightRecords.clear();
        await db.animals.bulkAdd(parsed.animals.map((a: Animal) => ({ ...a, id: undefined, createdAt: new Date(a.createdAt) })));
        await db.weightRecords.bulkAdd(parsed.records.map((r: WeightRecord) => ({ ...r, id: undefined, measuredAt: new Date(r.measuredAt) })));
      });
      await refresh(); alert("Respaldo importado correctamente.");
    } catch { alert("No se pudo importar. Verifica que sea un respaldo válido de MiHatoApp."); }
  }

  const nav = [
    { id: "inicio" as const, label: "Inicio", icon: Home },
    { id: "calculadora" as const, label: "Calcular", icon: Calculator },
    { id: "ganado" as const, label: "Mi ganado", icon: Beef },
    { id: "historial" as const, label: "Historial", icon: Activity }
  ];
  const title = { inicio: "Tu hato, bajo control", calculadora: "Calculadora de peso", ganado: "Mi ganado", historial: "Historial de pesajes" }[section];

  return <main className="shell">
    <header className="topbar">
      <div className="brand-wrap"><div className="logo"><Beef size={25}/></div><div><div className="brand">MiHatoApp</div><div className="subbrand">Gestión inteligente de ganado</div></div></div>
      <div className="status"><span className="dot"/><CloudOff size={14}/> Modo local</div>
    </header>

    {section === "inicio" && <>
      <section className="hero"><div><div className="eyebrow">Bienvenido a MiHatoApp</div><h1>El control de tu hato,<br/>en tus manos.</h1><p>Registra, estima y consulta el peso de tu ganado desde cualquier lugar, incluso sin internet.</p></div><div className="hero-icon"><Beef size={64}/></div></section>
      <section className="stats">
        <div className="stat"><div className="stat-label">Animales registrados</div><div className="stat-value">{ready ? animals.length : "—"}</div><div className="stat-foot">En tu dispositivo</div></div>
        <div className="stat"><div className="stat-label">Último peso guardado</div><div className="stat-value">{latestWeight ? `${latestWeight.toLocaleString("es-MX")} kg` : "—"}</div><div className="stat-foot">Última medición</div></div>
        <div className="stat"><div className="stat-label">Promedio registrado</div><div className="stat-value">{records.length ? `${average.toFixed(1)} kg` : "—"}</div><div className="stat-foot">{records.length} mediciones</div></div>
      </section>
      <div className="content-grid">
        <section className="panel"><div className="panel-head"><h2>Accesos rápidos</h2><span className="muted">¿Qué necesitas hacer?</span></div><div className="quick-grid">
          <button className="quick-card" onClick={() => setSection("calculadora")}><div className="quick-icon"><Scale size={20}/></div><strong>Calcular peso</strong><span>Estima el peso con medidas o cinta bovinométrica.</span></button>
          <button className="quick-card" onClick={() => setSection("ganado")}><div className="quick-icon"><Plus size={20}/></div><strong>Registrar animal</strong><span>Agrega un bovino a tu inventario.</span></button>
          <button className="quick-card" onClick={() => setSection("historial")}><div className="quick-icon"><ChartNoAxesCombined size={20}/></div><strong>Ver historial</strong><span>Consulta los pesajes que has guardado.</span></button>
          <button className="quick-card" onClick={exportBackup}><div className="quick-icon"><Download size={20}/></div><strong>Respaldar datos</strong><span>Descarga una copia de tu información.</span></button>
        </div></section>
        <section className="panel"><div className="panel-head"><h2>Actividad reciente</h2><span className="muted">Últimos registros</span></div>
          {records.length ? <div className="table-wrap"><table><thead><tr><th>Animal</th><th>Peso</th><th>Fecha</th></tr></thead><tbody>{records.slice(0,5).map(r=><tr key={r.id}><td>{r.animalLabel}</td><td><b>{r.weight} kg</b></td><td>{new Date(r.measuredAt).toLocaleDateString("es-MX")}</td></tr>)}</tbody></table></div> : <div className="empty">Aún no hay pesajes.<br/>Tu actividad aparecerá aquí.</div>}
        </section>
      </div>
      <div className="notice">Tus datos se guardan únicamente en este dispositivo. Descarga respaldos periódicamente para evitar perder tu información.</div>
    </>}

    {section === "calculadora" && <section className="panel">
      <div className="panel-head"><div><h2>Estima el peso vivo</h2><div className="muted">Selecciona el método de medición</div></div><Scale color="#557b53"/></div>
      <div className="tabs"><button className={`tab ${method==="body-measurements"?"active":""}`} onClick={()=>{setMethod("body-measurements");setResult(null);setError("");}}>Dos medidas</button><button className={`tab ${method==="bovinometric-tape"?"active":""}`} onClick={()=>{setMethod("bovinometric-tape");setResult(null);setError("");}}>Cinta bovinométrica</button></div>
      {method === "body-measurements" ? <><div className="field-grid">
        <div className="field"><label>Perímetro torácico (cm)</label><input type="number" min="1" step="0.1" placeholder="Ej. 150" value={girth} onChange={e=>setGirth(e.target.value)}/></div>
        <div className="field"><label>Largo corporal (cm)</label><input type="number" min="1" step="0.1" placeholder="Ej. 120" value={length} onChange={e=>setLength(e.target.value)}/></div>
      </div><div className="notice">Mide el perímetro detrás de las patas delanteras y el largo corporal desde la punta del hombro hasta la punta del isquion. Usa centímetros.</div></> :
      <div className="field"><label>Lectura indicada por la cinta (kg)</label><input type="number" min="1" step="0.1" placeholder="Ej. 250" value={tapeWeight} onChange={e=>setTapeWeight(e.target.value)}/><span className="muted">Introduce el peso que marca la escala de tu cinta, no el perímetro en centímetros.</span></div>}
      <div className="field section"><label>Asociar a un animal (opcional)</label><select value={selectedAnimalId} onChange={e=>setSelectedAnimalId(e.target.value)}><option value="">Sin asociar</option>{animals.map(a=><option key={a.id} value={a.id}>{a.earTag} · {a.name}</option>)}</select></div>
      {!selectedAnimalId && <div className="field section"><label>Identificación libre (opcional)</label><input value={animalLabel} onChange={e=>setAnimalLabel(e.target.value)} placeholder="Ej. Vaca 024"/></div>}
      <div className="btn-row"><button className="btn" onClick={calculate}>Calcular peso estimado</button><button className="btn btn-secondary" onClick={()=>{setGirth("");setLength("");setTapeWeight("");setResult(null);setError("");}}>Limpiar</button></div>
      {error && <div className="notice" role="alert">{error}</div>}
      {result !== null && <div className="result"><div className="result-label">Peso vivo estimado</div><div className="result-value">{result.toLocaleString("es-MX")} kg</div><div className="result-note">{method==="body-measurements"?"Estimación por fórmula de Schaeffer.":"Lectura transcrita de la cinta bovinométrica."} El resultado es orientativo y no sustituye el pesaje en báscula.</div><div className="btn-row"><button className="btn" onClick={saveMeasurement}>Guardar medición</button></div></div>}
    </section>}

    {section === "ganado" && <div className="content-grid">
      <section className="panel"><div className="panel-head"><h2>Registrar bovino</h2><Users color="#557b53"/></div><form onSubmit={addAnimal}>
        <div className="field-grid"><div className="field"><label>Número de arete *</label><input required value={tag} onChange={e=>setTag(e.target.value)} placeholder="Ej. 001"/></div><div className="field"><label>Nombre o alias *</label><input required value={animalName} onChange={e=>setAnimalName(e.target.value)} placeholder="Ej. Lucera"/></div>
        <div className="field"><label>Raza o cruza</label><input value={breed} onChange={e=>setBreed(e.target.value)} placeholder="Ej. Suizo x Cebú"/></div><div className="field"><label>Sexo</label><select value={sex} onChange={e=>setSex(e.target.value as "Macho"|"Hembra")}><option>Macho</option><option>Hembra</option></select></div></div>
        <div className="btn-row"><button className="btn" type="submit"><Plus size={15} style={{verticalAlign:"middle"}}/> Guardar animal</button></div>
      </form></section>
      <section className="panel"><div className="panel-head"><h2>Inventario</h2><span className="muted">{animals.length} animales</span></div>
        {animals.length ? <div className="table-wrap"><table><thead><tr><th>Arete</th><th>Nombre</th><th>Raza</th></tr></thead><tbody>{animals.map(a=><tr key={a.id}><td><b>{a.earTag}</b></td><td>{a.name}</td><td>{a.breed}</td></tr>)}</tbody></table></div> : <div className="empty">Aún no tienes animales registrados.</div>}
      </section>
    </div>}

    {section === "historial" && <section className="panel"><div className="panel-head"><div><h2>Mediciones guardadas</h2><div className="muted">Todos los registros de peso en este dispositivo</div></div><Activity color="#557b53"/></div>
      {records.length ? <div className="table-wrap"><table><thead><tr><th>Animal</th><th>Peso estimado</th><th>Método</th><th>Fecha</th></tr></thead><tbody>{records.map(r=><tr key={r.id}><td>{r.animalLabel}</td><td><b>{r.weight.toLocaleString("es-MX")} kg</b></td><td>{r.method==="body-measurements"?"Medidas":"Cinta"}</td><td>{new Date(r.measuredAt).toLocaleString("es-MX")}</td></tr>)}</tbody></table></div> : <div className="empty">No hay mediciones guardadas todavía.</div>}
      <div className="btn-row"><button className="btn btn-secondary" onClick={exportBackup}><Download size={15} style={{verticalAlign:"middle"}}/> Exportar respaldo</button><label className="btn btn-secondary"><Upload size={15} style={{verticalAlign:"middle"}}/> Importar respaldo<input type="file" accept="application/json" hidden onChange={e=>importBackup(e.target.files?.[0])}/></label></div>
    </section>}

    <nav className="nav">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={section===item.id?"active":""} onClick={()=>setSection(item.id)}><Icon size={17}/><span>{item.label}</span></button>})}</nav>
  </main>;
}
