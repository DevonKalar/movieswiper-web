import { useState, useEffect, useRef, useMemo } from 'react';
import { useAgentResponse } from '@/queries/useAgent';
import { useWatchlist } from '@/queries/useWatchlist';
import movioProfilePic from '@images/ai-avatar.jpg';
import { ChatBotIcon } from '@icons';
import type { ChatMessage } from '@/types/chat';
import type { Movie } from '@/types/movie';

const AiChat = () => {
	const [messages, setMessages] = useState<ChatMessage[]>([{
    sender: 'agent',
    content: 'Hello, I\'m Movio! Here to chat about all things movies! Can I recommend a movie, or answer some trivia questions for you?'
  }]);
	const [inputContent, setInputContent] = useState<string>("");
  const { likedMovies } = useWatchlist();
  const { mutateAsync: sendMessage, isPending: isAgentTyping } = useAgentResponse();

  const movieTitles = useMemo(() => likedMovies.map((movie: Movie) => movie.title).join(", "), [likedMovies]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setMessages(prev => [...prev, { sender: 'user', content: inputContent }]);
		setInputContent('');
    try {
      const response = await sendMessage({ userMessage: inputContent, likedMovies: movieTitles });
      setMessages(prev => [...prev, { sender: 'agent', content: response.content }]);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An unknown error occured');
      setMessages(prev => [...prev, {
        sender: 'agent',
        content: err.message || 'Sorry, I encountered an error. Please send your message again.',
        error: true
      }]);
    }
	};

	const chatMessagesRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		if (chatMessagesRef.current) {
			chatMessagesRef.current.scrollTo({
				top: chatMessagesRef.current.scrollHeight,
				behavior: 'smooth'
			});
		}
	};

	useEffect(() => {scrollToBottom();}, [messages, isAgentTyping]);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const toggleModal = () => setIsModalOpen(!isModalOpen);
	const closeModal = () => setIsModalOpen(false);
	
	return (
	<div className="flex flex-col items-end fixed max-w-full bottom-0 right-0 md:bottom-12 md:right-12 p-4 z-50 gap-2">
		
    {isModalOpen 
		? 
		(<div className="modal flex flex-col w-full md:w-96 gap-2 mb-4 bg-white border rounded-lg shadow-lg ">
			<div className="flex flex-row items-center justify-between p-4 gap-2 border-b-1">
				<div className="flex flex-row items-center gap-2">
				<img src={movioProfilePic} alt="AI Avatar" className="w-12 h-12 rounded-full bg-primary-subtle" />
				<p className="text-primary">Movio</p>
				</div>
				<button
					className="bg-transparent px-2 h-8 text-primary"
					onClick={closeModal}
				>x</button>
			</div>
			<div className="flex flex-col p-4 gap-2 max-h-96 overflow-y-auto" ref={chatMessagesRef}>
				{messages.map((chat, index) => {
					const isAgent = chat.sender === 'agent';
				return (
					<div key={`message-${index}`} className={`flex flex-col ${isAgent ? 'items-start mr-8' : 'items-end ml-8'} gap-1`}>
						<p className={`p-3 px-4 rounded-3xl font-light ${isAgent ? 'rounded-bl-none text-white bg-surface' : 'rounded-br-none text-primary-active bg-primary-subtle'} text-sm`}>{chat.content}</p>
						<p className="text-sm text-primary-muted font-light italic">{isAgent ? 'Movio' : 'You'}</p>
					</div>
					);
				})}
				{isAgentTyping && (<div className="flex flex-col items-start mr-8 gap-1">
					<p className="p-3 px-4 rounded-3xl font-light rounded-bl-none text-white bg-surface text-sm animate-pulse">Movio is typing...</p>
					<p className="text-sm text-primary-muted font-light italic">Movio</p>
				</div>)}
			</div>
			<div className="border-t-1 p-2">
				<form onSubmit={handleSubmit} className="flex flex-row items-center p-2 w-full">
					<input className="p-2 px-4 h-12 w-full text-primary rounded-3xl border-r-0 rounded-tr-none rounded-br-none" type="text" placeholder="Type your message..." value={inputContent} onChange={(e) => setInputContent(e.target.value)} />
					<button className="bg-surface text-white rounded-3xl rounded-tl-none rounded-bl-none" type="submit">Send</button>
				</form>
			</div>
		</div>) 
		: 
		(<button className="modal-button w-16 h-16 rounded-full " onClick={toggleModal}><ChatBotIcon /></button>)}

	</div>
    );
}

export default AiChat;