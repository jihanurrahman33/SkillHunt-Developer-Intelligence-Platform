import Modal from '@/components/modals/Modal';
import Button from '@/components/ui/Button';
import { FaGithub } from 'react-icons/fa';
import { HiOutlinePlus } from 'react-icons/hi';

export default function ImportDeveloperModal({
  isOpen,
  onClose,
  handleImport,
  githubUsername,
  setGithubUsername,
  isImporting
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isImporting && onClose()}
      title="Import Developer"
    >
      <form onSubmit={handleImport} className="space-y-4">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          Enter one or more GitHub usernames or profile URLs (separated by commas or new lines) to automatically fetch their profiles, calculate their activity scores, and add them to your talent pool.
        </p>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">GitHub Usernames or URLs</label>
          <div className="relative">
            <FaGithub className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <textarea
              placeholder="torvalds, https://github.com/gaearon, @yyx990803"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              disabled={isImporting}
              required
              autoFocus
              rows={4}
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isImporting}
            icon={!isImporting && <HiOutlinePlus className="h-4 w-4" />}
          >
            Import Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
