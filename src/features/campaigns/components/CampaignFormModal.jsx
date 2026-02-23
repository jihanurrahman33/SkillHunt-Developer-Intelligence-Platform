'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/modals/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCampaignContext } from '@/features/campaigns/context/CampaignContext';
import Swal from 'sweetalert2';

export default function CampaignFormModal({ isOpen, onClose, editingCampaign = null }) {
  const { addCampaign, editCampaign } = useCampaignContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      role: '',
      description: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (editingCampaign) {
      reset({
        title: editingCampaign.title,
        role: editingCampaign.role,
        description: editingCampaign.description || '',
        status: editingCampaign.status || 'active',
      });
    } else {
      reset({ title: '', role: '', description: '', status: 'active' });
    }
  }, [editingCampaign, isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    let result;

    if (editingCampaign) {
      result = await editCampaign(editingCampaign._id, data);
    } else {
      result = await addCampaign(data);
    }

    setIsSubmitting(false);

    if (result?.success) {
      Swal.fire({
        icon: 'success',
        title: editingCampaign ? 'Campaign Updated' : 'Campaign Created',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#0B1220',
        color: '#e2e8f0',
      });
      onClose();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result?.error || 'Something went wrong.',
        background: '#0B1220',
        color: '#e2e8f0',
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Campaign Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Q4 Senior Frontend Safari"
            {...register('title', { required: 'Title is required' })}
            className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
              errors.title ? 'border-danger focus:ring-danger' : 'border-border focus:ring-primary focus:border-primary'
            }`}
          />
          {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Target Role <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Senior React Developer"
            {...register('role', { required: 'Role is required' })}
            className={`w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 ${
              errors.role ? 'border-danger focus:ring-danger' : 'border-border focus:ring-primary focus:border-primary'
            }`}
          />
          {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief details about the campaign..."
            {...register('description')}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            {editingCampaign ? 'Save Changes' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
