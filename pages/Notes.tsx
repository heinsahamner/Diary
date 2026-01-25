
import React, { useState, useMemo } from 'react';
import { useStore } from '../services/store';
import { useToast } from '../components/Toast';
import { Note } from '../types';
import { 
    Plus, Search, X, Trash2, Pin, Palette, Check, 
    MoreVertical, StickyNote, Clock, Save, PinOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NOTE_COLORS = [
    { name: 'Default', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
    { name: 'Red', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-900/50' },
    { name: 'Orange', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-900/50' },
    { name: 'Yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-900/50' },
    { name: 'Green', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-900/50' },
    { name: 'Teal', bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-200 dark:border-teal-900/50' },
    { name: 'Blue', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-900/50' },
    { name: 'Purple', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-900/50' },
    { name: 'Pink', bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-200 dark:border-pink-900/50' },
];

export const Notes: React.FC = () => {
    const { notes, addNote, updateNote, deleteNote } = useStore();
    const { addToast } = useToast();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');
    const [formColor, setFormColor] = useState('Default');
    const [formPinned, setFormPinned] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

    const filteredNotes = useMemo(() => {
        let n = notes;
        if (search) {
            n = n.filter(note => 
                note.title.toLowerCase().includes(search.toLowerCase()) || 
                note.content.toLowerCase().includes(search.toLowerCase())
            );
        }
        return n.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        });
    }, [notes, search]);

    const handleOpenForm = (note?: Note) => {
        if (note) {
            setEditingNote(note);
            setFormTitle(note.title);
            setFormContent(note.content);
            setFormColor(note.color);
            setFormPinned(note.isPinned);
        } else {
            setEditingNote(null);
            setFormTitle('');
            setFormContent('');
            setFormColor('Default');
            setFormPinned(false);
        }
        setIsFormOpen(true);
    };

    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!formTitle.trim() && !formContent.trim()) return;

        const noteData: Note = {
            id: editingNote?.id || Date.now().toString(),
            title: formTitle,
            content: formContent,
            color: formColor,
            isPinned: formPinned,
            lastModified: new Date().toISOString()
        };

        if (editingNote) {
            updateNote(noteData);
            addToast('Anotação atualizada', 'success');
        } else {
            addNote(noteData);
            addToast('Anotação criada', 'success');
        }
        setIsFormOpen(false);
        setIsColorPickerOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Excluir esta anotação permanentemente?')) {
            deleteNote(id);
            addToast('Anotação excluída', 'info');
            setIsFormOpen(false);
        }
    };

    const togglePin = (note: Note) => {
        updateNote({ ...note, isPinned: !note.isPinned });
        addToast(note.isPinned ? 'Desfixado' : 'Fixado no topo', 'info');
    };

    const NoteCard: React.FC<{ note: Note }> = ({ note }) => {
        const colorCfg = NOTE_COLORS.find(c => c.name === note.color) || NOTE_COLORS[0];
        
        return (
            <div 
                onClick={() => handleOpenForm(note)}
                className={`group relative p-5 rounded-2xl border ${colorCfg.bg} ${colorCfg.border} shadow-sm hover:shadow-md transition-all cursor-pointer break-inside-avoid mb-4 animate-fade-in`}
            >
                {note.isPinned && (
                    <div className="absolute -top-2 -right-2 p-1.5 bg-indigo-600 text-white rounded-full shadow-lg z-10 scale-90">
                        <Pin size={12} fill="currentColor" />
                    </div>
                )}
                
                {note.title && <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{note.title}</h3>}
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-6">{note.content}</p>
                
                <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-gray-400 font-medium">
                        {format(new Date(note.lastModified), "d 'de' MMM", { locale: ptBR })}
                    </span>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => togglePin(note)}
                            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-gray-500"
                        >
                            {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="pb-24 animate-fade-in min-h-[80vh]">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <StickyNote className="text-indigo-600 dark:text-purple-400" />
                        Minhas Anotações
                    </h1>
                    <p className="text-sm text-gray-500">Capture ideias e lembretes rápidos</p>
                </div>
                
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar notas..."
                        className="w-full pl-10 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <StickyNote size={40} />
                    </div>
                    <p>{search ? 'Nenhuma nota encontrada.' : 'Sua mesa está limpa. Comece a anotar!'}</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
                    {filteredNotes.map(note => <NoteCard key={note.id} note={note} />)}
                </div>
            )}

            <button 
                onClick={() => handleOpenForm()}
                className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
            >
                <Plus size={32} />
            </button>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className={`bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-gray-200 dark:border-gray-700`}>
                        <form onSubmit={handleSave} className="flex-1 flex flex-col h-full overflow-hidden">
                            
                            <div className={`p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between ${NOTE_COLORS.find(c => c.name === formColor)?.bg}`}>
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                                        className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 transition-colors"
                                        title="Mudar Cor"
                                    >
                                        <Palette size={20} />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormPinned(!formPinned)}
                                        className={`p-2 rounded-xl transition-colors ${formPinned ? 'bg-indigo-600 text-white' : 'hover:bg-black/10 text-gray-500'}`}
                                        title="Fixar Nota"
                                    >
                                        <Pin size={20} />
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {editingNote && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleDelete(editingNote.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                    <button 
                                        type="button" 
                                        onClick={() => setIsFormOpen(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {isColorPickerOpen && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 animate-slide-in">
                                    {NOTE_COLORS.map(c => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => { setFormColor(c.name); setIsColorPickerOpen(false); }}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${c.bg} ${formColor === c.name ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                        >
                                            {formColor === c.name && <Check size={14} className="mx-auto text-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="p-8 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                                <input 
                                    className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-300"
                                    placeholder="Título"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    autoFocus
                                />
                                <textarea 
                                    className="w-full text-lg bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-300 resize-none min-h-[300px]"
                                    placeholder="Comece a escrever..."
                                    value={formContent}
                                    onChange={e => setFormContent(e.target.value)}
                                />
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Clock size={12} />
                                    <span>{editingNote ? `Modificado em ${format(new Date(editingNote.lastModified), "dd/MM 'às' HH:mm")}` : 'Nova Nota'}</span>
                                </div>
                                <button 
                                    type="submit"
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                                >
                                    <Save size={18} />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};