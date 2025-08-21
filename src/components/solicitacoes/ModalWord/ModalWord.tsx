import BaseModal from "@/components/libs/BaseModal/BaseModal";
import useModal from "@/context/Modal/Modal";
import WordLikeEditor from "@/modules/WordLikeEditor";

export default function ModalWord() {
  const { modalContent, setModalContent } = useModal();

  return (
    <BaseModal
      title="Criar Documento"
      open={!!modalContent}
      onOpenChange={(open) => {
        if (!open) setModalContent(null);
      }}
    >
      <div className="h-full">
        <WordLikeEditor />
      </div>
    </BaseModal>
  );
}
