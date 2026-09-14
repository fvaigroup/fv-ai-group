# Graph Report - fv-ai-group  (2026-09-14)

## Corpus Check
- 30 files · ~148,876 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .xml 1)

## Summary
- 74 nodes · 85 edges · 16 communities (12 shown, 4 thin omitted)
- Extraction: 72% EXTRACTED · 25% INFERRED · 4% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.8)
- Token cost: 772,185 input · 0 output

## Community Hubs (Navigation)
- Core Services Content
- Homepage & Business Lines
- Service Landing Pages
- Brand & Platform Integrations
- Client Logos (Killjoy/Licorway)
- Primary Logo Identity
- Vercel Configuration
- Logo Mark & Casa del Mocho
- Casa del Mocho Brand
- Natural Sweet Client
- Larva Mascot Motif
- FAQ Question Mark Icon
- Neon Triangle Logo
- Hexagon Logo Icon
- Triangle Brand Graphic
- 404 Error Page

## God Nodes (most connected - your core abstractions)
1. `Home Page (index)` - 11 edges
2. `Contact Form (Contacto)` - 10 edges
3. `Precios Page` - 8 edges
4. `Servicios Page` - 8 edges
5. `Cómo Trabajamos (Methodology Section)` - 7 edges
6. `Despliegue y Ejecución (Service)` - 6 edges
7. `F&V AI Group (Brand/Company)` - 5 edges
8. `Habilitación de Equipos (Service)` - 4 edges
9. `Auditoria, implementacion y capacitacion de sistemas empresariales con IA` - 4 edges
10. `Acompañamiento Continuo (Service)` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Finanzas con IA (Course)` --semantically_similar_to--> `Habilitación de Equipos (Service)`  [INFERRED] [semantically similar]
  curso-finanzas-ia.html → habilitacion-equipos.html
- `Línea Hexágono (High-Ticket Business Line)` --semantically_similar_to--> `Por Qué Elegir F&V (Differentiator Section)`  [INFERRED] [semantically similar]
  index.html → nosotros.html
- `Luci Assistant Widget` --conceptually_related_to--> `Contact Form (Contacto)`  [INFERRED]
  index.html → contacto.html
- `Home Page (index)` --references--> `Cursos Catalog Page`  [EXTRACTED]
  index.html → cursos.html
- `Servicios Page` --references--> `Acompañamiento Continuo Page`  [EXTRACTED]
  servicios.html → acompanamiento-continuo.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **F&V Six-Stage Service Methodology** — asesoria_estrategica_service, evaluacion_procesos_service, despliegue_ejecucion_service, habilitacion_equipos_service, masterclasses_workshops_service, acompanamiento_continuo_service [EXTRACTED 1.00]
- **Contact Form Legal Consent Flow** — contacto_contact_form, privacidad_page, terminos_page [EXTRACTED 1.00]
- **Luci FAQ Widget Shared Across Pages** — index_luci_assistant, servicios_page, nosotros_page, precios_page, contacto_page [INFERRED 0.85]

## Communities (16 total, 4 thin omitted)

### Community 0 - "Core Services Content"
Cohesion: 0.24
Nodes (14): Acompañamiento Continuo (Service), Asesoría Estratégica (Service), Contact Form (Contacto), Finanzas con IA (Course), Finanzas con IA Course Page, Cursos Catalog Page, Evaluación de Procesos (Service), Habilitación de Equipos (Service) (+6 more)

### Community 1 - "Homepage & Business Lines"
Cohesion: 0.25
Nodes (10): Contacto Page, Despliegue y Ejecución (Service), Microsoft Dynamics 365 (Platform), Línea Hexágono (High-Ticket Business Line), Línea Triángulo (Mid-Ticket Business Line), Odoo (Platform), Home Page (index), SAP (Platform) (+2 more)

### Community 2 - "Service Landing Pages"
Cohesion: 0.29
Nodes (7): Acompañamiento Continuo Page, Asesoría Estratégica Page, Despliegue y Ejecución Page, Evaluación de Procesos Page, Habilitación de Equipos Page, Masterclasses y Workshops Page, Servicios Page

### Community 3 - "Brand & Platform Integrations"
Cohesion: 0.43
Nodes (7): F&V AI Group Open Graph Image, Dynamics 365, F&V AI Group (Brand/Company), Dragonfly Hexagon Logo Mark, Auditoria, implementacion y capacitacion de sistemas empresariales con IA, Odoo, SAP

### Community 4 - "Client Logos (Killjoy/Licorway)"
Cohesion: 0.40
Nodes (5): Clientes (Clients Assets Folder), Killjoy Client Logo, Killjoy (Client/Brand), Licorway Logo, Licorway (Client)

### Community 5 - "Primary Logo Identity"
Cohesion: 0.83
Nodes (4): logo-full.png (FV AI Group Logo), FV AI Group Brand Identity, Dragonfly/Insect Glyph (AI Spark Symbol), Hexagon Ring Motif (Cyan-to-Orange Gradient)

### Community 6 - "Vercel Configuration"
Cohesion: 0.50
Nodes (3): cleanUrls, headers, trailingSlash

### Community 7 - "Logo Mark & Casa del Mocho"
Cohesion: 0.67
Nodes (3): Casa del Mocho Logo, Logo Mark (Dragonfly/Firefly Icon), FV AI Group Brand Identity

### Community 8 - "Casa del Mocho Brand"
Cohesion: 0.67
Nodes (3): Bear Mascot Illustration, Casa del Mocho Brand, Casa del Mocho Logo

### Community 9 - "Natural Sweet Client"
Cohesion: 0.67
Nodes (3): Clientes (Client Logos) Assets Directory, Natural Sweet Logo, Natural Sweet (Client)

### Community 10 - "Larva Mascot Motif"
Cohesion: 0.67
Nodes (3): larva.jpg (Neon Glowing Larva/Worm Illustration), Larva/Worm Mascot Motif, Neon Glow Visual Design Style

### Community 11 - "FAQ Question Mark Icon"
Cohesion: 0.67
Nodes (3): signos.png (Neon Question Marks Graphic), FAQ / Questions Visual Motif, Spanish Inverted Question Mark (¿)

## Ambiguous Edges - Review These
- `Home Page (index)` → `robots.txt`  [AMBIGUOUS]
  robots.txt · relation: references
- `Logo Mark (Dragonfly/Firefly Icon)` → `Casa del Mocho Logo`  [AMBIGUOUS]
  assets/logo-mark.png · relation: conceptually_related_to
- `F&V AI Group Open Graph Image` → `Dragonfly Hexagon Logo Mark`  [AMBIGUOUS]
  assets/og-image.png · relation: shares_data_with

## Knowledge Gaps
- **32 isolated node(s):** `cleanUrls`, `trailingSlash`, `headers`, `404 Not Found Page`, `Acompañamiento Continuo Page` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 33 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Home Page (index)` and `robots.txt`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Logo Mark (Dragonfly/Firefly Icon)` and `Casa del Mocho Logo`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `F&V AI Group Open Graph Image` and `Dragonfly Hexagon Logo Mark`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **Why does `Home Page (index)` connect `Homepage & Business Lines` to `Core Services Content`, `Service Landing Pages`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `Servicios Page` connect `Service Landing Pages` to `Homepage & Business Lines`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Contact Form (Contacto)` connect `Core Services Content` to `Homepage & Business Lines`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `cleanUrls`, `trailingSlash`, `headers` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._