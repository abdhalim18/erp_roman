import { getSettings } from '@/app/actions/settings'
import { SettingsForm } from './settings-form-component'

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your store configuration and preferences.
                </p>
            </div>
            <div className="border-t pt-6">
                <SettingsForm initialSettings={settings} />
            </div>
        </div>
    )
}
