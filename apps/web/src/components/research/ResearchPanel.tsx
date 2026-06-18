import { motion } from "framer-motion";
import { Search, ExternalLink, Globe, BookOpen, Clock } from "lucide-react";

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchPanelProps {
  sources: Source[];
  isSearching: boolean;
  query: string | null;
}

export function ResearchPanel({ sources, isSearching, query }: ResearchPanelProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-200">
      <div className="flex-shrink-0 p-4 border-b border-slate-800/60 bg-slate-900/10">
        <h3 className="text-xs font-display font-semibold tracking-wider text-slate-400 uppercase">
          Live Research Feed
        </h3>
        {query && (
          <p className="text-[10px] text-slate-500 mt-1 truncate max-w-full">
            Query: {query}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Searching Status */}
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl border border-cyan-teal/20 bg-cyan-teal/5 flex gap-3 items-center"
          >
            <div className="relative flex-shrink-0">
              <div className="w-6 h-6 rounded-full border border-cyan-teal/30 flex items-center justify-center">
                <Search className="w-3 h-3 text-cyan-teal animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border border-cyan-teal/40 pulse-ring" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-cyan-teal">Scout Agent Active</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">Retrieving web search indices...</div>
            </div>
          </motion.div>
        )}

        {/* Citations List */}
        {!isSearching && sources.length > 0 && (
          <div className="space-y-2.5">
            {sources.map((src, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/60 hover:border-slate-700/60 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className="w-3.5 h-3.5 text-cyan-teal/70 flex-shrink-0" />
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-300 hover:text-cyan-teal truncate transition-colors"
                    >
                      {src.title}
                    </a>
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-0.5 rounded text-slate-500 hover:text-white hover:bg-slate-800/60 flex-shrink-0 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1.5 line-clamp-3">
                  {src.snippet}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[9px] text-slate-500 font-medium">
                  <BookOpen className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[150px]">{new URL(src.url).hostname}</span>
                  <span className="ml-auto bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                    Source [{idx + 1}]
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && sources.length === 0 && (
          <div className="text-center py-20 text-slate-600">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-xs font-medium">No live research active</p>
            <p className="text-[10px] text-slate-500 max-w-[150px] mx-auto mt-1 leading-normal">
              Citations and search sources appear here during web queries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
