# JSF Page → Bean → GraphBrainAPI Mapping Report

## 1. `graph.xhtml` → `GraphBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Export Whole Graph | `exportPl()` | `gb.toPrologExpanded(GraphDBexport.SYNTACTIC)` |
| Export PageRank | `exportPrologPageRank()` | `gb.getPageRank(numberPrologNodes)` |
| Select Node | `selectNode()` | `gb.getEntityAttributes(selectedInstanceId)` |

---

## 2. `node.xhtml` → `NodeBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Prev/Next | `gotoPrev()` / `gotoNext()` | `gb.updateAccessStatisticsEnt()`, `gb.getEntity()` |
| Insert | `insertNode()` | `gb.createEntity()`, `gb.compileAttributes()`, `gb.persistCreateEnt()` |
| Update | `updateNode()` | `gb.editEntity()` |
| Delete | `deleteEntity()` | `gb.deleteEntityInstance()` |
| Approve/Disapprove/Comment | `supportEntity()` / `attackEntity()` / `commentEntity()` | `gb.insertStatus()` |
| Add/Remove Domain | `addDomain()` / `removeDomain()` | `gb.addDomainInstance()`, `gb.removeDomainInstance()`, `gb.addDomain()`, `gb.removeDomain()` |
| AutoComplete field | `completeFieldText()` | `gb.getAttributeValues()` |
| Attachments table (render) | — | `gb.getAttachmentsEnt()` |

---

## 3. `record.xhtml` → `RecordBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Prev/Next | `gotoPrev()` / `gotoNext()` | `gb.updateAccessStatisticsEnt()`, `gb.getEntity()` |
| Select record name | `changedRecordName()` | `gb.getDomainData()`, `gb.getEntity()` |
| Subgraph loading (init) | — | `gb.findRelatedEntities()`, `gb.findIncomingEntities()`, `gb.getAllNeighbors()` |
| Approve/Disapprove/Comment | `supportEntity()` / `attackEntity()` / `commentEntity()` | `gb.insertStatus()` |
| Add/Remove Domain | `addDomain()` / `removeDomain()` | `gb.addDomainInstance()`, `gb.removeDomainInstance()`, `gb.addDomain()`, `gb.removeDomain()` |
| Insert | `insertNode()` | `gb.createEntity()`, `gb.compileAttributes()`, `gb.persistCreateEnt()` |
| Update | `updateNode()` | `gb.editEntity()` |
| Delete | `deleteEntity()` | `gb.deleteEntityInstance()` |

---

## 4. `schema.xhtml` → `SchemaBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Load domain | `changedDomain()` | `gb.getDomains()` |
| All schema edit ops (add/rename/delete class, attribute, relationship) | various | **No direct GB API calls** — operations are on local `DomainData` object |
| Export (XML/OWL/Prolog) | `exportToXML()` / `exportToOWL()` / `exportToProlog()` | Uses `TranslatorXML`, `TranslatorOWL`, `TranslatorProlog` (not direct GB calls) |

---

## 5. `relation.xhtml` → `RelationBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Invert | `swapSubjectObject()` | `gb.getDomainData()` |
| Search relationships | `search()` | `gb.searchRelationTriples()` |
| Insert relationship | `insertRelation()` | `gb.insertRelationInstance()`, `gb.compileAttributes()` |
| Update relationship | `updateRelation()` | `gb.updateRelationInstance()` |
| Delete relationship | `deleteRelation()` | `gb.deleteRelationInstance()` |
| Approve/Disapprove/Comment | `supportRelation()` / `attackRelation()` / `commentRelation()` | `gb.insertStatus()` |
| Filter subject/object/relation | `filter()` | `gb.filterSubjects()`, `gb.filterRelations()`, `gb.filterObjects()`, `gb.filterSubjectClasses()`, `gb.filterObjectClasses()` |
| Attachments (render) | — | `gb.getAttachmentsRel()` |
| Access tracking | — | `gb.updateAccessStatisticsRel()` |

---

## 6. `merge.xhtml` → `MergeBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Node metadata (render) | — | `gb.hasAttachments()`, `gb.outDegree()`, `gb.inDegree()` |
| Graph node | `mergeNode()` | `gb.mergeNode()`, `gb.insertStatus()` |
| Graph arc | `mergeArc()` | `gb.mergeArc()` |

---

## 7. `prolog.xhtml` → `PrologBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Neo4j → Prolog | `graphConverter()` | `gb.toPrologExpanded(GraphDBexport.SYNTACTIC)` |
| PostgreSQL → Prolog | `postgresConverter()` | `gb.postgresConverter(path)` |

---

## 8. `welcome.xhtml` → `WelcomeBean`

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Page init (constructor) | `WelcomeBean()` | `gb.getUsername()`, `gb.getCredit()`, `gb.userRights()`, `gb.getDomains()`, `gb.getRanking()`, `gb.getUserContributions()` |
| Select domain dropdown | `changedDomain()` | `gb.changedDomain(webInfFolder, domain)`, `gb.getUserContributions()`, `gb.getRanking()` |
| Reset domain | `resetDomain()` | `gb.setDomainData(null)` → then `changedDomain()` |
| Send Suggestion | `sendSuggestion()` | `gb.insertSuggestion(notes)` |
| Statistics table (render) | — | populated via `gb.getUserContributions()` at init |
| Hall of Fame table (render) | — | populated via `gb.getRanking()` at init |

---

## 9. `profile.xhtml` → `UserProfileBean` ⚠️

| Page Action | Bean Method | GB API Call |
|---|---|---|
| Change Password dialog | `userProfileBean.cambiaPassword()` | **Bean class `UserProfileBean` does not exist in the project — feature unimplemented** |

---

## 10. `home.xhtml` — No bean

Static page with two navigation links (`updateMetadata`, `mergeNode`). No bean, no GB API calls.

---

## 11. `guide.xhtml` / `login.xhtml`

No GraphBrainAPI calls — guide is informational, login is handled by `LoginBean` internally.

---

## Architecture Note

All beans obtain the `GB` instance via a `GBWrapper` stored in the HTTP session. Beans are `@SessionScoped` Jakarta EE CDI beans backed by JSF 2.3 / PrimeFaces.
