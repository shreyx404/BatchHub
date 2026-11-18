import os
import pptx
from pptx.util import Pt, Inches
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import PP_PLACEHOLDER
from pptx.oxml import parse_xml

def generate_presentation():
    input_path = 'BatchHub_Presentation.pptx' if os.path.exists('BatchHub_Presentation.pptx') else 'Copy of Presentation.pptx'
    output_path = 'BatchHub_Presentation.pptx'
    
    prs = pptx.Presentation(input_path)
    
    # Palette definition (BatchHub editorial dual-theme)
    COLOR_PRIMARY = RGBColor(24, 23, 22)     # Deep charcoal #181716
    COLOR_MUTED = RGBColor(70, 70, 70)       # Dark charcoal/gray #464646
    COLOR_ACCENT = RGBColor(168, 106, 36)    # Warm amber / gold #A86A24
    COLOR_BLUE = RGBColor(97, 151, 237)      # Title blue #6197ED
    COLOR_FOOTER = RGBColor(110, 110, 110)   # Footer gray
    
    # -----------------------------------------------------------------
    # Helper: Set bullet formatting on paragraph
    # -----------------------------------------------------------------
    def format_paragraph_bullet(paragraph, level=0, is_numbered=False):
        pPr = paragraph._p.get_or_add_pPr()
        # Clean up any inherited sizing or removal tags
        for child in list(pPr):
            if child.tag.endswith(('buNone', 'buSzPts', 'buClr')):
                pPr.remove(child)
        if level == 0 and is_numbered:
            buNone = parse_xml('<a:buNone xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>')
            pPr.append(buNone)

    # -----------------------------------------------------------------
    # Helper: Update footer across all slides
    # -----------------------------------------------------------------
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.FOOTER:
                shape.left = Inches(2.0)
                shape.width = Inches(6.0)
                shape.text_frame.clear()
                p = shape.text_frame.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER
                r = p.add_run()
                r.text = "BatchHub — Fundamentals of Data Structures (FDS)"
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
                r.font.color.rgb = COLOR_FOOTER

    # -----------------------------------------------------------------
    # Helper: Update slide title
    # -----------------------------------------------------------------
    def set_slide_title(slide, text, font_size=32):
        for shape in slide.shapes:
            if shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.TITLE:
                shape.left = Inches(1.30)
                shape.top = Inches(0.40)
                shape.width = Inches(7.50)
                shape.height = Inches(1.05)
                tf = shape.text_frame
                tf.clear()
                p = tf.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER
                r = p.add_run()
                r.text = text
                r.font.name = "Times New Roman"
                r.font.size = Pt(font_size)
                r.font.bold = True
                r.font.color.rgb = COLOR_PRIMARY

    # -----------------------------------------------------------------
    # Helper: Populate slide body
    # -----------------------------------------------------------------
    def set_slide_body(slide, sections, is_numbered=False, base_size=13, sub_size=11):
        for shape in slide.shapes:
            if shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.BODY:
                shape.left = Inches(0.65)
                shape.top = Inches(1.60)
                shape.width = Inches(8.70)
                shape.height = Inches(4.85)
                tf = shape.text_frame
                tf.clear()
                
                first = True
                for sec in sections:
                    header = sec["header"]
                    items = sec.get("items", [])
                    
                    p_head = tf.paragraphs[0] if first else tf.add_paragraph()
                    first = False
                    p_head.level = 0
                    p_head.space_before = Pt(5) if not first else Pt(0)
                    p_head.space_after = Pt(2)
                    format_paragraph_bullet(p_head, level=0, is_numbered=is_numbered)
                    
                    r_head = p_head.add_run()
                    r_head.text = header
                    r_head.font.name = "Times New Roman"
                    r_head.font.size = Pt(base_size)
                    r_head.font.bold = True
                    r_head.font.color.rgb = COLOR_PRIMARY
                    
                    for item in items:
                        p_sub = tf.add_paragraph()
                        p_sub.level = 1
                        p_sub.space_before = Pt(1.5)
                        p_sub.space_after = Pt(1.5)
                        format_paragraph_bullet(p_sub, level=1, is_numbered=False)
                        
                        if isinstance(item, tuple):
                            prefix, desc = item
                            r_pre = p_sub.add_run()
                            r_pre.text = prefix + " "
                            r_pre.font.name = "Times New Roman"
                            r_pre.font.size = Pt(sub_size)
                            r_pre.font.bold = True
                            r_pre.font.color.rgb = COLOR_ACCENT
                            
                            r_desc = p_sub.add_run()
                            r_desc.text = desc
                            r_desc.font.name = "Times New Roman"
                            r_desc.font.size = Pt(sub_size)
                            r_desc.font.bold = False
                            r_desc.font.color.rgb = COLOR_MUTED
                        else:
                            r_txt = p_sub.add_run()
                            r_txt.text = str(item)
                            r_txt.font.name = "Times New Roman"
                            r_txt.font.size = Pt(sub_size)
                            r_txt.font.bold = False
                            r_txt.font.color.rgb = COLOR_MUTED

    # =================================================================
    # SLIDE 1: Title Slide
    # =================================================================
    s1 = prs.slides[0]
    for shape in s1.shapes:
        if shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.CENTER_TITLE:
            shape.top = Inches(1.85)
            shape.height = Inches(0.95)
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER
            r = p.add_run()
            r.text = "BatchHub"
            r.font.name = "Times New Roman"
            r.font.size = Pt(36)
            r.font.bold = True
            r.font.color.rgb = COLOR_PRIMARY
            
            p2 = tf.add_paragraph()
            p2.alignment = PP_ALIGN.CENTER
            p2.space_before = Pt(4)
            r2 = p2.add_run()
            r2.text = "Centralized Academic Information Gallery & Data Structures Engine"
            r2.font.name = "Times New Roman"
            r2.font.size = Pt(14)
            r2.font.bold = True
            r2.font.color.rgb = COLOR_ACCENT

        elif shape.is_placeholder and shape.placeholder_format.type == PP_PLACEHOLDER.SUBTITLE:
            shape.top = Inches(5.62)
            tf = shape.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER
            r = p.add_run()
            r.text = "Class: SE Computer Engineering          Division: ____          Batch: ____"
            r.font.name = "Times New Roman"
            r.font.size = Pt(15)
            r.font.bold = True
            r.font.color.rgb = COLOR_PRIMARY
            
            p2 = tf.add_paragraph()
            p2.alignment = PP_ALIGN.CENTER
            p2.space_before = Pt(6)
            r2 = p2.add_run()
            r2.text = "Project Guide: Prof. ____________________"
            r2.font.name = "Times New Roman"
            r2.font.size = Pt(15)
            r2.font.bold = True
            r2.font.color.rgb = COLOR_PRIMARY

        elif shape.has_table:
            # Leave student info blank as strictly instructed
            for r_idx in range(1, len(shape.table.rows)):
                for c_idx in range(len(shape.table.columns)):
                    shape.table.rows[r_idx].cells[c_idx].text = ""

    print("Slide 1 built.")

    # =================================================================
    # SLIDE 2: Abstract
    # =================================================================
    set_slide_title(prs.slides[1], "Abstract", font_size=34)
    s2_sections = [
        {
            "header": "Academic Information Fragmentation & The Core Problem",
            "items": [
                ("The Issue:", "Critical college circulars, lab assignments, and submission deadlines are scattered across noisy messaging chats (WhatsApp), personal threads, and disorganized Drive folders."),
                ("Student Impact:", "Students routinely suffer from cognitive fatigue, information asymmetry, and missed deadlines due to the lack of a single, authoritative, chronological repository.")
            ]
        },
        {
            "header": "The BatchHub Solution — Unified Academic Gallery",
            "items": [
                ("Platform Core:", "A centralized, responsive web platform engineered specifically for engineering batches, providing a structured feed, interactive calendar, archive, and study notes gallery."),
                ("Design System:", "Features an editorial elevated dual-theme aesthetic (Dark `#000000` / Light paper `#F8F7F4`), sharp 0px border-radius, and warm amber accents.")
            ]
        },
        {
            "header": "Curriculum Data Structures Integration (FDS Core)",
            "items": [
                ("Production Algorithms:", "Employs custom, zero-dependency implementations of curriculum data structures to power real-time application features:"),
                ("Min-Heap Priority Queue:", "Powers the live upcoming deadline banner with O(1) root inspection."),
                ("Doubly Linked List:", "Enables seamless O(1) bidirectional post navigation in the post detail view."),
                ("Sorting & Telemetry Engine:", "Empirically sorts archives with live comparison and swap telemetry across 5 sorting algorithms."),
                ("Interactive Showcase (/ds):", "Interactive visualizer lab demonstrating all 6 syllabus units (Complexity, Sorts, Lists, Queues, Trees, Graphs).")
            ]
        }
    ]
    set_slide_body(prs.slides[1], s2_sections, is_numbered=False, base_size=13, sub_size=11)
    print("Slide 2 built.")

    # =================================================================
    # SLIDE 3: Flow Of Program
    # =================================================================
    set_slide_title(prs.slides[2], "Flow Of Program", font_size=34)
    s3_sections = [
        {
            "header": "1. Data Ingestion & Dual-Engine Persistence Pipeline",
            "items": [
                ("Supabase PostgreSQL Client:", "Direct PostgREST queries with Row-Level Security (RLS) restricting public anonymous access strictly to published & archived rows."),
                ("Offline Mock Fallback:", "Zero-config in-memory fallback engine (DEMO_POSTS, DEMO_SUBJECTS) enabling 100% full-feature operation without cloud database configuration.")
            ]
        },
        {
            "header": "2. Security Gateway & Authentication Pipeline (/api/admin)",
            "items": [
                ("5-Tier Defense:", "Cloudflare Turnstile token validation → Client hardware/WebGL device fingerprinting → Persistent IP/Device rate limiting (24h lockout) → Timing-safe SHA-256 hash comparison.")
            ]
        },
        {
            "header": "3. Core Data Structure Algorithmic Engines",
            "items": [
                ("Min-Heap Priority Queue:", "Ingests deadlines, maintains min-heap invariant (O(log n) insert), and roots nearest deadline for live ticking countdown banner (O(1) peek)."),
                ("Doubly Linked List:", "Chains published posts into bidirectional nodes (prev ↔ data ↔ next) for instantaneous O(1) pointer navigation without array scanning."),
                ("Custom Sorting & Telemetry:", "Executes user-selected algorithms (Quick, Merge, Insertion, Selection, Bubble) with live comparison and swap telemetry counters.")
            ]
        },
        {
            "header": "4. Reactive Client Presentation & Automation Layer",
            "items": [
                ("React 19 SPA Views:", "Homepage feed, interactive Calendar (Month/Week/Agenda), Archive search, Study Notes directory, and interactive DS Showcase (/ds)."),
                ("Automated Workers:", "Daily Vercel Cron worker auto-archives expired notices; Discord webhook delivers cryptographically verified alert broadcasts.")
            ]
        }
    ]
    set_slide_body(prs.slides[2], s3_sections, is_numbered=True, base_size=13, sub_size=11)
    print("Slide 3 built.")

    # =================================================================
    # SLIDE 4: Topics Covered from Syllabus (Units I - VI)
    # =================================================================
    set_slide_title(prs.slides[3], "List Of The Topics/ Concept Which Are Covered From The Syllabus", font_size=22)
    s4_sections = [
        {
            "header": "Section I: Foundational Concepts & Linear Data Structures (Units I - III)",
            "items": [
                ("Unit I (Complexity Analysis & ADTs):", "Abstract Data Types, linear vs. non-linear classification, asymptotic analysis (Big-O, Big-Ω, Big-Θ), time-space trade-offs, and empirical growth functions (complexity.js)."),
                ("Unit II (Arrays, Searching & Sorting):", "1D/2D arrays, Sparse Matrix triplet representation & transpose, Linear & Binary Search, 5 Sorting Algorithms (Bubble, Selection, Insertion, Merge, Quick Sort) with telemetry (sorting.js)."),
                ("Unit III (Linked Lists):", "Singly, Doubly, and Circular Linked Lists; node operations (insert, delete, traverse, search). Doubly Linked List actively powers bidirectional post navigation in PostPage.jsx.")
            ]
        },
        {
            "header": "Section II: Stacks, Queues, Trees & Graphs (Units IV - VI)",
            "items": [
                ("Unit IV (Stacks and Queues):", "Stack ADT, Infix to Postfix conversion, Postfix evaluation; Linear Queue, Circular Queue, Deque; Min-Heap Priority Queue actively powers real-time deadline urgency banner (priorityQueue.js)."),
                ("Unit V (Trees):", "Binary Search Tree (BST) with insert, search, delete, and traversals (Inorder, Preorder, Postorder); Expression Tree construction from postfix and recursive evaluation (expressionTree.js)."),
                ("Unit VI (Graphs):", "Adjacency List & Matrix representations, BFS & DFS traversals; Topological Sorting for DAG academic prerequisite sequencing (graph.js).")
            ]
        }
    ]
    set_slide_body(prs.slides[3], s4_sections, is_numbered=False, base_size=13, sub_size=11)
    print("Slide 4 built.")

    # =================================================================
    # SLIDE 5: Topics Out of Syllabus
    # =================================================================
    set_slide_title(prs.slides[4], "List Of The Topics/ Concept Which Are Out Of Syllabus", font_size=22)
    s5_sections = [
        {
            "header": "1. Modern Reactive Frontend Architecture & Single Page Application (SPA)",
            "items": [
                ("Production Tech Stack:", "React 19 SPA, Vite 6 build engine, React Router v7 with route code-splitting, dynamic imports, and lazy loading via React.Suspense."),
                ("Design System:", "Tailwind CSS v4 @theme design tokens, custom CSS variables, dual dark/light theme persistence, and sharp 0px border-radius editorial styling.")
            ]
        },
        {
            "header": "2. Cloud Relational Database & Row-Level Security (RLS)",
            "items": [
                ("PostgreSQL Engine:", "Supabase PostgreSQL with relational joins, automated updated_at timestamp triggers, and JSONB resource links."),
                ("Zero-Trust RLS:", "Declarative PostgreSQL Row-Level Security policies restricting anonymous clients strictly to published and archived posts.")
            ]
        },
        {
            "header": "3. 5-Tier Production Security Architecture",
            "items": [
                ("Multi-Layer Defense:", "Cloudflare Turnstile bot verification, WebGL/canvas device fingerprinting, persistent 24h lockout rate limiting, and timing-safe SHA-256 hash comparison (crypto.timingSafeEqual).")
            ]
        },
        {
            "header": "4. Serverless Backend, Cron Workers & Webhook Integration",
            "items": [
                ("Serverless & Cron:", "Vercel Serverless Functions (/api/admin.js, /api/calendar.js) and Vercel Cron worker (/api/cron/auto-archive.js) for scheduled daily maintenance."),
                ("Discord Webhooks:", "Cryptographic Ed25519 signature verification (DISCORD_PUBLIC_KEY) for instant automated academic broadcast notifications.")
            ]
        }
    ]
    set_slide_body(prs.slides[4], s5_sections, is_numbered=True, base_size=13, sub_size=11)
    print("Slide 5 built.")

    # =================================================================
    # SLIDE 6: Final Output of Project
    # =================================================================
    set_slide_title(prs.slides[5], "Final Output of Project", font_size=34)
    s6_sections = [
        {
            "header": "1. Student Feed & Deadlines Urgency Banner (/)",
            "items": [
                ("Live Academic Ledger:", "Structured feed (Pinned Notices, General Deliverables) with live countdown banner driven by Min-Heap Priority Queue (O(1) peek).")
            ]
        },
        {
            "header": "2. Interactive Academic Calendar (/calendar) & Notes Gallery (/notes)",
            "items": [
                ("Multi-View Calendar:", "Month grid, Week view, and chronological Agenda list with slide-over deadline submission inspector."),
                ("Curated Notes Gallery:", "Folder-based directory linking to externally hosted high-yield academic study notes, syllabus guides, and lab manuals.")
            ]
        },
        {
            "header": "3. Academic Archive with Algorithmic Telemetry (/archive)",
            "items": [
                ("Archive & FDS Selector:", "Searchable repository of past deliverables with real-time FDS sorting algorithm selector (Quick, Merge, Insertion, Selection, Bubble) and live comparison/swap badge.")
            ]
        },
        {
            "header": "4. Editorial Post Reader (/post/:id) & Interactive DS Showcase (/ds)",
            "items": [
                ("Post Reader:", "Markdown post detail view with Doubly Linked List bidirectional previous/next navigation buttons (O(1) pointer jumps)."),
                ("DS Showcase Lab:", "Comprehensive interactive visualizer covering all 6 syllabus units (Big-O curves, sorting animations, search tracer, linked lists, expression trees, and subject DAG).")
            ]
        },
        {
            "header": "5. 5-Layer Secure Admin Management Suite (/admin)",
            "items": [
                ("Admin Console:", "Protected management console for post authoring, drag-and-drop link ordering, subject folder management, and system settings.")
            ]
        }
    ]
    set_slide_body(prs.slides[5], s6_sections, is_numbered=True, base_size=12.5, sub_size=10.5)
    print("Slide 6 built.")

    # =================================================================
    # SLIDE 7: Conclusion
    # =================================================================
    set_slide_title(prs.slides[6], "Conclusion", font_size=34)
    s7_sections = [
        {
            "header": "Elimination of Academic Information Scatter",
            "items": [
                ("Single Source of Truth:", "BatchHub successfully replaces scattered, ephemeral WhatsApp messages with a unified, high-speed academic gallery, ensuring zero missed deadlines and clear communication.")
            ]
        },
        {
            "header": "Direct Production Validation of Foundational Data Structures",
            "items": [
                ("Theory to Production:", "Proves that FDS data structures are practical engineering tools that optimize real web application performance:"),
                ("Priority Queue (Min-Heap):", "Guarantees O(1) immediate root peek for urgent deadlines instead of costly O(n log n) array re-sorting."),
                ("Doubly Linked List:", "Provides instantaneous O(1) bidirectional post navigation without repetitive O(n) array searches."),
                ("Empirical Sorting Telemetry:", "Provides full transparency into algorithm efficiency, comparison counts, and swap metrics on real batch data.")
            ]
        },
        {
            "header": "Enterprise-Grade Security & Engineering Excellence",
            "items": [
                ("Resilient Architecture:", "Engineered with 5-layer security (Cloudflare Turnstile, device fingerprinting, 24h lockout rate limiting, timing-safe crypto, RLS policies) and dual-mode reliability.")
            ]
        },
        {
            "header": "Scalability & Future Scope",
            "items": [
                ("Future Outlook:", "Architected for seamless expansion into multi-department college tenancy, Progressive Web App (PWA) push notifications, and automated multi-channel bot alerts.")
            ]
        }
    ]
    set_slide_body(prs.slides[6], s7_sections, is_numbered=False, base_size=13, sub_size=11)
    print("Slide 7 built.")

    # =================================================================
    # SLIDE 8: Thank You
    # =================================================================
    s8 = prs.slides[7]
    s8_shape4 = s8.shapes[4]
    s8_shape4.top = Inches(2.3)
    s8_shape4.height = Inches(3.0)
    s8_tf = s8_shape4.text_frame
    s8_tf.clear()
    
    p_ty = s8_tf.paragraphs[0]
    p_ty.alignment = PP_ALIGN.CENTER
    r_ty = p_ty.add_run()
    r_ty.text = "Thank You"
    r_ty.font.name = "Arial"
    r_ty.font.size = Pt(50)
    r_ty.font.bold = True
    r_ty.font.color.rgb = COLOR_BLUE
    
    p_subty1 = s8_tf.add_paragraph()
    p_subty1.alignment = PP_ALIGN.CENTER
    p_subty1.space_before = Pt(14)
    r_subty1 = p_subty1.add_run()
    r_subty1.text = "BatchHub — Centralized Academic Information Gallery"
    r_subty1.font.name = "Times New Roman"
    r_subty1.font.size = Pt(18)
    r_subty1.font.bold = True
    r_subty1.font.color.rgb = COLOR_PRIMARY
    
    p_subty2 = s8_tf.add_paragraph()
    p_subty2.alignment = PP_ALIGN.CENTER
    p_subty2.space_before = Pt(6)
    r_subty2 = p_subty2.add_run()
    r_subty2.text = "Fundamentals of Data Structures (FDS) Course Project"
    r_subty2.font.name = "Times New Roman"
    r_subty2.font.size = Pt(15)
    r_subty2.font.bold = False
    r_subty2.font.color.rgb = COLOR_ACCENT

    p_subty3 = s8_tf.add_paragraph()
    p_subty3.alignment = PP_ALIGN.CENTER
    p_subty3.space_before = Pt(10)
    r_subty3 = p_subty3.add_run()
    r_subty3.text = "Questions & Discussion"
    r_subty3.font.name = "Times New Roman"
    r_subty3.font.size = Pt(15)
    r_subty3.font.bold = True
    r_subty3.font.color.rgb = COLOR_MUTED
    
    print("Slide 8 built.")

    prs.save(output_path)
    print(f"\nFinal presentation successfully generated at: {output_path}")

if __name__ == '__main__':
    generate_presentation()
