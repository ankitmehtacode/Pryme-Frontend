import os
import re

with open("src/pages/Dashboard.tsx", "r") as f:
    code = f.read()

# I will replace the main blocks using regex or string splitting
# Split the code at `return (` which is around line 545
parts = code.split('  return (\n    <>\n      <Helmet><title>Client Portal | PRYME Bank-Grade Solutions</title></Helmet>\n      <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">\n        <Header />')

if len(parts) == 2:
    header_part = parts[0]
    tail_part = parts[1]
    
    # We will redefine tail_part with our new JSX
    new_jsx = """  return (
    <>
      <Helmet><title>Client Portal | PRYME Bank-Grade Solutions</title></Helmet>
      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] selection:bg-primary/20">
        <Header />

        <PageShell className="flex-1 pb-[var(--space-section)]">
          <AnimatePresence mode="wait">
            {viewState === "FUNNEL" && (
              <motion.div 
                key="funnel"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <Surface className="relative overflow-hidden mb-[var(--space-10)] p-[var(--space-8)] md:p-[var(--space-12)] border border-[hsl(var(--border))]/40 dark:border-[hsl(var(--border))]/10 bg-[hsl(var(--background))]/60 backdrop-blur-3xl">
                  {/* Subtle Glowing Orbs */}
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                  
                  <Inline justify="space-between" align="start" className="relative z-10 mb-[var(--space-10)] flex-col md:flex-row gap-[var(--space-8)]">
                    <Inline gap="var(--space-6)" align="start" className="flex-col md:flex-row items-center md:items-start">
                      <div className="w-20 h-20 rounded-[var(--surface-radius)] bg-gradient-to-br from-white/80 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-[hsl(var(--border))]/50 dark:border-[hsl(var(--border))]/10 flex items-center justify-center shadow-lg">
                        <Target className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Stack gap="var(--space-3)">
                        <h1 className="text-[length:var(--text-display)] font-extrabold tracking-tight text-[hsl(var(--foreground))]">
                          Application Funnel
                        </h1>
                        <Inline gap="var(--space-3)" align="center" className="flex-wrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20 backdrop-blur-md">
                            ID: {activeApplication?.applicationId || "Initializing..."}
                          </span>
                          <span className="text-[length:var(--text-small)] font-medium text-[hsl(var(--muted-foreground))] flex items-center">
                            Routing to: <span className="text-[hsl(var(--foreground))] font-bold ml-1">{activeApplication?.targetBank || "Pryme Aggregator"}</span>
                          </span>
                        </Inline>
                      </Stack>
                    </Inline>
                    
                    <Stack align="end" className="w-full md:w-auto bg-white/40 dark:bg-black/20 p-[var(--space-5)] rounded-[var(--surface-radius)] border border-white/50 dark:border-white/5 backdrop-blur-lg">
                      <Inline align="baseline" gap="var(--space-2)">
                        <span className="text-[length:var(--text-display)] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none">
                          {Math.min(currentStage === 1 ? 5 : (currentStage - 1) * 50, 100)}
                        </span>
                        <span className="text-[length:var(--text-heading)] font-bold text-[hsl(var(--muted-foreground))]">%</span>
                      </Inline>
                      <p className="text-[length:var(--text-caption)] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em]">Completion</p>
                    </Stack>
                  </Inline>
                  
                  {/* Premium Progress Track */}
                  <div className="relative z-10 h-4 w-full bg-[hsl(var(--secondary))]/50 rounded-full overflow-hidden border border-white/60 dark:border-white/5 backdrop-blur-md shadow-inner">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(currentStage === 1 ? 5 : (currentStage - 1) * 50, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    >
                      {/* Glass Shimmer Effect */}
                      <div className="absolute inset-0 w-full h-full opacity-30" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}></div>
                    </motion.div>
                  </div>
                </Surface>

                <SplitLayout className="grid-cols-1 lg:grid-cols-12 gap-[var(--layout-panel-gap,var(--space-8))] items-start">
                  <SplitLayout.Media className="lg:col-span-4 sticky top-[var(--space-8)]">
                    <Surface className="p-[var(--space-6)]">
                      <h3 className="font-bold text-[hsl(var(--foreground))] mb-[var(--space-6)]">Pipeline Stages</h3>
                      <Stack gap="var(--space-6)">
                        {stages.map((s) => {
                          const isCompleted = currentStage > s.id;
                          const isActive = currentStage === s.id;
                          return (
                            <Inline key={s.id} gap="var(--space-4)" className="items-start">
                              <div className="mt-1">
                                {isCompleted ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : 
                                 isActive ? <Circle className="w-6 h-6 text-blue-500 fill-blue-500/10" /> : 
                                 <Circle className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />}
                              </div>
                              <Stack gap="var(--space-1)">
                                <p className={`font-semibold ${isActive ? "text-blue-500" : isCompleted ? "text-[hsl(var(--muted-foreground))]" : "text-[hsl(var(--foreground))]"}`}>{s.label}</p>
                                <p className="text-[length:var(--text-caption)] text-[hsl(var(--muted-foreground))]">{s.desc}</p>
                              </Stack>
                            </Inline>
                          );
                        })}
                      </Stack>
                    </Surface>
                  </SplitLayout.Media>

                  <SplitLayout.Content className="lg:col-span-8">
                    <motion.div key={currentStage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <Surface className="p-[var(--space-8)] relative overflow-hidden">
                        
                        {currentStage === 1 && (
                          <Stack gap="var(--space-6)" className="relative z-10">
                            <h2 className="text-[length:var(--text-heading)] font-bold border-b border-[hsl(var(--border))] pb-[var(--space-4)]">1. Identity & Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-6)]">
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="panNumber">PAN Number *</Label>
                                <Input id="panNumber" value={formData.panNumber} onChange={(e) => handleInputChange("panNumber", e.target.value)} placeholder="ABCDE1234F" className="bg-[hsl(var(--background))] uppercase" maxLength={10} />
                              </Stack>
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="dob">Date of Birth *</Label>
                                <Input id="dob" type="date" value={formData.dob} onChange={(e) => handleInputChange("dob", e.target.value)} className="bg-[hsl(var(--background))]" />
                              </Stack>
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="currentCity">Current City *</Label>
                                <Input id="currentCity" value={formData.currentCity} onChange={(e) => handleInputChange("currentCity", e.target.value)} className="bg-[hsl(var(--background))]" />
                              </Stack>
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="pinCode">Pin Code *</Label>
                                <Input id="pinCode" value={formData.pinCode} onChange={(e) => handleInputChange("pinCode", e.target.value.replace(/\D/g, ''))} maxLength={6} className="bg-[hsl(var(--background))]" />
                              </Stack>
                            </div>
                          </Stack>
                        )}

                        {currentStage === 2 && (
                          <Stack gap="var(--space-8)" className="relative z-10">
                            <Inline gap="var(--space-3)" align="center" className="border-b border-[hsl(var(--border))] pb-[var(--space-4)]">
                              <div className="bg-blue-500/10 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-500"/></div>
                              <Stack gap="var(--space-1)">
                                <h2 className="text-[length:var(--text-heading)] font-bold">2. Document Vault</h2>
                                <p className="text-[length:var(--text-small)] text-[hsl(var(--muted-foreground))]">Final step. Securely upload documents to initiate underwriting.</p>
                              </Stack>
                            </Inline>

                            <Stack gap="var(--space-8)">
                              {docGroups.map((group) => {
                                const categoryColors: Record<string, string> = {
                                  "Identity Documents": "bg-blue-500",
                                  "Income Documents": "bg-emerald-500",
                                  "Property Documents": "bg-amber-500",
                                  "Financial Documents": "bg-purple-500",
                                  "Business Proof": "bg-indigo-500",
                                  "Additional Documents": "bg-slate-500"
                                };
                                const badgeColor = categoryColors[group.displayName] || "bg-blue-500";
                                
                                const totalDocs = group.docs.length;
                                const securedDocs = group.docs.filter(d => uploadedDocs[d.id] || uploadedDocs[normalizeDocName(d.name)]).length;

                                return (
                                <div key={group.category} className="relative pl-[var(--space-6)]">
                                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${badgeColor} rounded-full opacity-60`}></div>
                                  <Inline justify="space-between" align="center" className="mb-[var(--space-4)]">
                                    <h4 className="text-[length:var(--text-small)] font-bold tracking-wider text-[hsl(var(--foreground))] uppercase">{group.displayName}</h4>
                                    <span className="text-[length:var(--text-caption)] font-semibold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-2 py-1 rounded-md">{securedDocs} / {totalDocs} Uploaded</span>
                                  </Inline>
                                  <Stack gap="var(--space-4)">
                                    {group.docs.map((doc) => {
                                      const isUploading = uploadingDocs[doc.id];
                                      const isUploaded = uploadedDocs[doc.id] || uploadedDocs[normalizeDocName(doc.name)];
                                      const isDragging = dragOverDocId === doc.id;
                                      const isConfirmingDelete = confirmDeleteId === doc.id;

                                      let cardClass = "doc-card-pending";
                                      if (isDragging) cardClass = "doc-card-dragover";
                                      if (isUploading) cardClass = "doc-card-uploading animate-pulse-glow";
                                      if (isUploaded) cardClass = "doc-card-secured";

                                      return (
                                        <Inline 
                                          key={doc.id} 
                                          align="center"
                                          justify="space-between"
                                          className={`group relative p-[var(--space-5)] rounded-[var(--surface-radius)] ${cardClass}`}
                                          onDragOver={(e) => onDragOver(e, doc.id)}
                                          onDragLeave={onDragLeave}
                                          onDrop={(e) => onDrop(e, doc)}
                                        >
                                          <Stack gap="var(--space-1)" className="z-10">
                                            <Inline align="center" gap="var(--space-2)">
                                              {isUploaded && <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-checkmark" />}
                                              <span className={`font-semibold text-[length:var(--text-small)] ${isUploaded ? 'text-emerald-900' : 'text-[hsl(var(--foreground))]'}`}>
                                                {doc.name} {doc.required && !isUploaded && <span className="text-red-500 ml-1">*</span>}
                                              </span>
                                            </Inline>
                                            {!isUploaded && <span className="text-[length:var(--text-caption)] text-[hsl(var(--muted-foreground))]">PDF, JPG, PNG up to 10MB</span>}
                                            {isUploaded && <span className="text-[length:var(--text-caption)] text-emerald-600/80 font-medium">Secured with AES-256</span>}
                                          </Stack>
                                          
                                          <Inline align="center" gap="var(--space-3)" className="z-10">
                                            <input 
                                              title={`Upload ${doc.name}`}
                                              type="file" 
                                              id={`upload-${doc.id}`} 
                                              className="hidden" 
                                              accept=".pdf,.jpg,.jpeg,.png"
                                              onChange={(e) => handleFileUpload(doc, e)}
                                              disabled={isUploading || isUploaded}
                                            />
                                            
                                            {isUploading && (
                                              <Inline align="center" gap="var(--space-2)" className="bg-blue-50 text-blue-700 px-[var(--space-4)] py-[var(--space-2)] rounded-[var(--surface-radius)] font-medium text-[length:var(--text-small)]">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Encrypting
                                              </Inline>
                                            )}

                                            {isUploaded && !isUploading && (
                                              <Inline align="center" gap="var(--space-2)">
                                                {isConfirmingDelete ? (
                                                  <Inline align="center" className="bg-[hsl(var(--background))] shadow-sm border border-red-100 rounded-[var(--surface-radius)] p-1 animate-in fade-in zoom-in duration-200">
                                                    <span className="text-[length:var(--text-caption)] font-medium text-red-600 px-2">Remove?</span>
                                                    <Button size="sm" variant="ghost" className="h-7 hover:bg-red-50 text-red-600 px-2" onClick={() => handleRemoveDocument(doc)}>Yes</Button>
                                                    <Button size="sm" variant="ghost" className="h-7 hover:bg-slate-100 px-2" onClick={() => setConfirmDeleteId(null)}>No</Button>
                                                  </Inline>
                                                ) : (
                                                  <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-emerald-600/50 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                    onClick={() => setConfirmDeleteId(doc.id)}
                                                  >
                                                    <X className="w-4 h-4" />
                                                  </Button>
                                                )}
                                              </Inline>
                                            )}

                                            {!isUploaded && !isUploading && (
                                              <Label 
                                                htmlFor={`upload-${doc.id}`} 
                                                className="inline-flex items-center justify-center rounded-[var(--surface-radius)] text-[length:var(--text-small)] font-semibold transition-all focus-visible:outline-none border border-[hsl(var(--border))] bg-[hsl(var(--background))] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm h-10 px-4 cursor-pointer"
                                              >
                                                <UploadCloud className="w-4 h-4 mr-2 text-blue-500" />
                                                Browse Files
                                              </Label>
                                            )}
                                          </Inline>
                                        </Inline>
                                      );
                                    })}
                                  </Stack>
                                </div>
                                )})}
                            </Stack>
                          </Stack>
                        )}

                        <div className="mt-[var(--space-10)] pt-[var(--space-6)] border-t border-[hsl(var(--border))] flex justify-end relative z-10">
                          <Button 
                            onClick={currentStage === 2 ? handleFinalSubmit : handleNextStage} 
                            disabled={isSaving}
                            className="h-12 px-8 text-[length:var(--text-body)] bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 disabled:opacity-70 transition-all"
                          >
                            {isSaving ? (
                              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {currentStage === 2 ? "Securing Data..." : "Saving..."}</>
                            ) : (
                              <>{currentStage === 2 ? "Submit to Underwriter" : "Save & Continue"} <ChevronRight className="w-5 h-5 ml-2" /></>
                            )}
                          </Button>
                        </div>
                      </Surface>
                    </motion.div>
                  </SplitLayout.Content>
                </SplitLayout>
              </motion.div>
            )}
          </AnimatePresence>

          {(viewState === "DASHBOARD" || viewState === "EMPTY") && (
            <AnimatePresence mode="wait">
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <div className="aurora-gradient pt-[var(--space-section)] pb-[var(--space-12)] border-b border-[hsl(var(--border))] mb-[var(--space-section)]">
                  <ContentContainer width="max">
                    <Inline justify="space-between" align="end" className="flex-col md:flex-row gap-[var(--space-4)]">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                        <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-[var(--space-2)] tracking-tight">Client Portfolio</h1>
                        <p className="text-[hsl(var(--muted-foreground))] text-[length:var(--text-large)]">Real-time tracking for your active financial instruments.</p>
                      </motion.div>
                      <Inline gap="var(--space-3)" align="center">
                        {isAdmin && (
                          <Button onClick={() => navigate("/admin")} variant="outline" className="border-[hsl(var(--border))]">
                            <Building2 className="w-4 h-4 mr-2" /> Admin Core
                          </Button>
                        )}
                        <Link to="/apply">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                            New Application <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </Inline>
                    </Inline>
                  </ContentContainer>
                </div>

                <ContentContainer width="max">
                  {viewState === "EMPTY" ? (
                    <Surface className="p-[var(--space-16)] text-center shadow-sm">
                      <div className="w-20 h-20 bg-[hsl(var(--muted))]/60 rounded-full flex items-center justify-center mx-auto mb-[var(--space-6)] border border-[hsl(var(--border))]/50">
                        <FileText className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <h3 className="text-[length:var(--text-heading)] font-bold text-[hsl(var(--foreground))] mb-[var(--space-2)]">No Active Instruments</h3>
                      <p className="text-[hsl(var(--muted-foreground))] mb-[var(--space-8)] max-w-md mx-auto">Your portfolio is empty. Click below to initiate a new loan application and explore our banking partners.</p>
                      <Link to="/apply"><Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">Initialize Application</Button></Link>
                    </Surface>
                  ) : (
                    <Stack gap="var(--space-6)">
                      {myApplications.map((app, index) => {
                        const config = getStatusConfig(app.status);
                        const StatusIcon = config.icon;
                        return (
                          <motion.div key={app.applicationId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: index * 0.1 }}>
                            <Surface className="overflow-hidden hover:border-primary/20 transition-all shadow-sm">
                              <div className="p-[var(--space-6)] md:p-[var(--space-8)] flex flex-col md:flex-row gap-[var(--space-6)] md:gap-[var(--space-12)] justify-between">
                                <Stack gap="var(--space-4)" className="flex-1">
                                  <Inline gap="var(--space-3)" align="center">
                                    <span className={cn("inline-flex items-center gap-[var(--space-1)] px-3 py-1 rounded-full text-[length:var(--text-caption)] font-semibold border", config.color)}>
                                      <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                                    </span>
                                    <span className="text-[length:var(--text-small)] font-mono font-medium text-[hsl(var(--muted-foreground))]">{app.applicationId}</span>
                                  </Inline>
                                  <div>
                                    <p className="text-[length:var(--text-caption)] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-[var(--space-1)]">{app.loanType?.replace(/_/g, " ") || "PERSONAL LOAN"}</p>
                                    <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                                      <Wallet className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                                      ₹{app.requestedAmount?.toLocaleString("en-IN") || "0"}
                                    </h3>
                                  </div>
                                </Stack>
                                <Stack gap="var(--space-6)" className="flex-1 max-w-sm">
                                  <div>
                                    <Inline justify="space-between" align="center" className="text-[length:var(--text-small)] mb-[var(--space-3)] font-medium">
                                      <span className="text-[hsl(var(--foreground))]">Processing Matrix</span>
                                      <span className="text-primary tabular-nums">{app.completionPercentage || config.progress}%</span>
                                    </Inline>
                                    <Progress value={app.completionPercentage || config.progress} className="h-2 bg-[hsl(var(--muted))] [&>div]:bg-primary" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-[var(--space-4)] pt-[var(--space-4)] border-t border-[hsl(var(--border))]">
                                    <div>
                                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-bold mb-[var(--space-1)]">Initiated</p>
                                      <p className="text-[length:var(--text-small)] font-medium text-[hsl(var(--foreground))]">{app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-bold mb-[var(--space-1)]">Assignee</p>
                                      <p className="text-[length:var(--text-small)] font-medium text-[hsl(var(--foreground))]">{app.assignee || "Evaluating"}</p>
                                    </div>
                                  </div>
                                  <div className="pt-[var(--space-2)] border-t border-[hsl(var(--border))]/50">
                                    <Button 
                                      variant="ghost" 
                                      className="w-full justify-between hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                                      onClick={() => {
                                        setActiveApplication(app);
                                        // 🧠 SILICON VALLEY FEATURE: Re-hydrate the form allowing post-submission edits
                                        if (app.metadata) {
                                          try {
                                            const parsedMeta = typeof app.metadata === "string" ? JSON.parse(app.metadata) : app.metadata;
                                            setFormData(prev => ({ ...prev, ...parsedMeta }));
                                          } catch(e) { console.error(e); }
                                        }

                                        if (app.documents && app.documents.length > 0) {
                                          const loadedDocs: Record<string, boolean> = {};
                                          app.documents.forEach((d) => {
                                            if (d.docType) loadedDocs[d.docType] = true;
                                          });
                                          setUploadedDocs(loadedDocs);
                                        }

                                        setViewState("FUNNEL");
                                        setCurrentStage(1);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                    >
                                      <span className="flex items-center"><Edit2 className="w-4 h-4 mr-2" /> Update Information / Documents</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </Stack>
                              </div>
                            </Surface>
                          </motion.div>
                        );
                      })}
                    </Stack>
                  )}
                </ContentContainer>
              </motion.div>
            </AnimatePresence>
          )}
        </PageShell>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
"""
    
    with open("src/pages/Dashboard.tsx", "w") as f:
        f.write(header_part + new_jsx)
else:
    print("Failed to split!")
