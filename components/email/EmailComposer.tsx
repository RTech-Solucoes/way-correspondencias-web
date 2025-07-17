'use client';

import { useState } from 'react';
import { X, Send, Paperclip, Smile, Bold, Italic, Underline, List, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface EmailComposerProps {
  onClose(): void;
}

export default function EmailComposer({ onClose }: EmailComposerProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const handleSend = () => {
    // Logic to send email
    console.log('Sending email:', { to, cc, bcc, subject, content });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Nova Mensagem
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Recipients */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="to" className="w-12 text-sm font-medium">To:</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Destinatários"
              className="flex-1"
            />
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

          {showCc && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="cc" className="w-12 text-sm font-medium">Cc:</Label>
              <Input
                id="cc"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Cópia"
                className="flex-1"
              />
            </div>
          )}

          {showBcc && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="bcc" className="w-12 text-sm font-medium">Cco:</Label>
              <Input
                id="bcc"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="Cópia oculta"
                className="flex-1"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Label htmlFor="subject" className="w-12 text-sm font-medium">Assunto:</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto"
              className="flex-1"
            />
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="p-2 border-b border-gray-200">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Underline className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Link className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escreva sua mensagem..."
            className="w-full h-full resize-none border-none focus:ring-0 p-0 text-base"
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
              <Button variant="secondary">
                Salvar Rascunho
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Ctrl + Enter para enviar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}