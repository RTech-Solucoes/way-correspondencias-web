'use client';

import { useState, useRef, useEffect } from 'react';
import {
  XIcon,
  PaperPlaneRightIcon,
  PaperclipIcon,
  SmileyIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  ListIcon,
  LinkIcon,
  FileTextIcon,
  ChatCircleIcon
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailComposerProps {
  onClose(): void;
  onSend?: (email: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    content: string;
    date: string;
  }) => void;
  initialTo?: string;
  initialSubject?: string;
  initialContent?: string;
  isReply?: boolean;
  isForward?: boolean;
  originalEmail?: {
    id: string | undefined;
    from: string | undefined;
    fromEmail: string | undefined;
    subject: string | undefined;
    content: string;
    date: string;
    attachments?: any[];
    isStarred?: boolean;
  };
  emailConfig?: {
    defaultMessages: {
      [key: string]: string;
    };
    defaultFooter: string;
  };
}

export default function EmailComposer({ 
  onClose,
  onSend,
  initialTo = '',
  initialSubject = '',
  initialContent = '',
  isReply = false,
  isForward = false,
  originalEmail,
  emailConfig
}: EmailComposerProps) {
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(isReply ? `Re: ${initialSubject}` : isForward ? `Fwd: ${initialSubject}` : initialSubject);
  const [toError, setToError] = useState<string | null>(null);
  const [ccError, setCcError] = useState<string | null>(null);
  const [bccError, setBccError] = useState<string | null>(null);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const getInitialContent = () => {
    if (isReply && originalEmail) {
      return `<br><br>-------- Mensagem Original --------<br>De: ${originalEmail.from} &lt;${originalEmail.fromEmail}&gt;<br>Data: ${originalEmail.date}<br>Assunto: ${originalEmail.subject}<br><br>${originalEmail.content}`;
    } else if (isForward && originalEmail) {
      return `<br><br>-------- Mensagem Encaminhada --------<br>De: ${originalEmail.from} &lt;${originalEmail.fromEmail}&gt;<br>Data: ${originalEmail.date}<br>Assunto: ${originalEmail.subject}<br><br>${originalEmail.content}`;
    }
    return initialContent;
  };
  
  const [content, setContent] = useState(getInitialContent());
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const handleBold = () => formatText('bold');
  const handleItalic = () => formatText('italic');
  const handleUnderline = () => formatText('underline');
  const handleList = () => formatText('insertUnorderedList');
  const handleLink = () => {
    const url = prompt('Enter the URL:');
    if (url) formatText('createLink', url);
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const insertDefaultMessage = (messageText: string) => {
    if (editorRef.current) {
      const formattedText = messageText.replace(/\n/g, '<br>');

      document.execCommand('insertHTML', false, formattedText);

      setContent(editorRef.current.innerHTML);

      editorRef.current.focus();
    }
  };

  const insertDefaultFooter = () => {
    if (editorRef.current && emailConfig?.defaultFooter) {
      const formattedFooter = emailConfig.defaultFooter.replace(/\n/g, '<br>');

      const footerWithBreaks = '<br><br>' + formattedFooter;

      editorRef.current.focus();

      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      document.execCommand('insertHTML', false, footerWithBreaks);

      setContent(editorRef.current.innerHTML);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmails = (emails: string): boolean => {
    if (!emails.trim()) return false;

    const emailList = emails.split(',').map(email => email.trim());
    return emailList.every(email => isValidEmail(email));
  };

  const handleSend = () => {
    setToError(null);
    setCcError(null);
    setBccError(null);
    setSubjectError(null);

    let isValid = true;

    if (!to.trim()) {
      setToError("O campo destinatário é obrigatório");
      isValid = false;
    } else if (!validateEmails(to)) {
      setToError("Por favor, insira um endereço de email válido");
      isValid = false;
    }

    if (cc.trim() && !validateEmails(cc)) {
      setCcError("Por favor, insira endereços de email válidos");
      isValid = false;
    }

    if (bcc.trim() && !validateEmails(bcc)) {
      setBccError("Por favor, insira endereços de email válidos");
      isValid = false;
    }

    if (!subject.trim()) {
      setSubjectError("O campo assunto é obrigatório");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const emailData = { 
      to, 
      cc, 
      bcc, 
      subject, 
      content: editorRef.current?.innerHTML || content,
      date: new Date().toISOString()
    };
    console.log('Sending email:', emailData);

    if (onSend) {
      onSend(emailData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <PaperPlaneRightIcon className="h-5 w-5 mr-2" />
            Nova Mensagem
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Recipients */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex flex-col items-start space-y-2">
            <Label htmlFor="to" className="w-12 text-sm font-medium">Para:</Label>
            <div className="flex w-full items-center space-x-2">
              <div className="w-full">
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    if (e.target.value.trim()) {
                      setToError(null);
                    }
                  }}
                  placeholder="Destinatários"
                  className={`w-full ${toError ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {toError && (
                  <p className="text-red-500 text-sm mt-1">{toError}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCc(!showCc)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Cc
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBcc(!showBcc)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Cco
                </Button>
              </div>
            </div>
          </div>

          {showCc && (
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="cc" className="w-12 text-sm font-medium">Cc:</Label>
              <div className="w-full">
                <Input
                  id="cc"
                  value={cc}
                  onChange={(e) => {
                    setCc(e.target.value);
                    if (ccError) setCcError(null);
                  }}
                  placeholder="Cópia"
                  className={`flex-1 ${ccError ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {ccError && (
                  <p className="text-red-500 text-sm mt-1">{ccError}</p>
                )}
              </div>
            </div>
          )}

          {showBcc && (
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="bcc" className="w-12 text-sm font-medium">Cco:</Label>
              <div className="w-full">
                <Input
                  id="bcc"
                  value={bcc}
                  onChange={(e) => {
                    setBcc(e.target.value);
                    if (bccError) setBccError(null);
                  }}
                  placeholder="Cópia oculta"
                  className={`flex-1 ${bccError ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {bccError && (
                  <p className="text-red-500 text-sm mt-1">{bccError}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col items-start space-y-2">
            <Label htmlFor="subject" className="w-12 text-sm font-medium">Assunto:</Label>
            <div className="w-full">
              <Input
                id="subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (e.target.value.trim()) {
                    setSubjectError(null);
                  }
                }}
                placeholder="Assunto"
                className={`flex-1 ${subjectError ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {subjectError && (
                <p className="text-red-500 text-sm mt-1">{subjectError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleBold} title="Bold">
              <TextBIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleItalic} title="Italic">
              <TextItalicIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleUnderline} title="Underline">
              <TextUnderlineIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={handleList} title="Bullet List">
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLink} title="Insert Link">
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            
            {/* Default Messages Dropdown */}
            {emailConfig && Object.keys(emailConfig.defaultMessages).length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" title="Inserir Mensagem Padrão">
                    <ChatCircleIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {Object.entries(emailConfig.defaultMessages).map(([name, text], index) => (
                    <DropdownMenuItem 
                      key={index}
                      onClick={() => insertDefaultMessage(text)}
                    >
                      {name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Default Footer Button */}
            {emailConfig?.defaultFooter && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={insertDefaultFooter}
                title="Inserir Assinatura Padrão"
              >
                <FileTextIcon className="h-4 w-4" />
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" title="Attach File">
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Insert Emoji">
              <SmileyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            className="w-full h-full p-4 overflow-auto focus:outline-none"
            style={{ minHeight: '200px' }}
            placeholder="Escreva sua mensagem..."
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Button variant="secondary">
              Salvar Rascunho
            </Button>
            <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
              Enviar
              <PaperPlaneRightIcon className="h-4 w-4 ml-2" />
            </Button>
            {/*<div className="flex items-center space-x-2 text-sm text-gray-500">*/}
            {/*  <span>Ctrl + Enter para enviar</span>*/}
            {/*</div>*/}
          </div>

        </div>
      </div>
    </div>
  );
}