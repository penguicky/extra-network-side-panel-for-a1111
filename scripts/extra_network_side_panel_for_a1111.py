from modules import script_callbacks, ui_extra_networks, shared
import gradio as gr


def on_ui_settings():
    section = ('side_panels', 'Side Panels')
    page_titles = [page.title for page in ui_extra_networks.extra_pages]

    # Default tab setting
    shared.opts.add_option(
        'extra_networks_side_panel_default_tab',
        shared.OptionInfo(
            page_titles[0],
            'Extra networks side panel default tab',
            gr.Radio,
            {
                'choices': page_titles,
            },
            section=section
        ).info('The default tab that is selected when opening the extra networks side panel')
    )

    # Card size setting
    shared.opts.add_option(
        'extra_networks_side_panel_card_size',
        shared.OptionInfo(
            'Medium',
            'Side panel card size',
            gr.Radio,
            {
                'choices': ['Small', 'Medium', 'Large', 'Extra Large'],
            },
            section=section
        ).info('Size of the extra network cards (thumbnails) in the side panel. Changes apply after reopening the side panel.')
    )

    # Initial panel width setting
    shared.opts.add_option(
        'extra_networks_side_panel_initial_width',
        shared.OptionInfo(
            60,
            'Initial side panel width (%)',
            gr.Slider,
            {
                'minimum': 30,
                'maximum': 80,
                'step': 5,
            },
            section=section
        ).info('Default width of the side panel as a percentage of the viewport. The generation tab will take the remaining space. Changes apply after reopening the side panel.')
    )

    # Auto-hide setting
    shared.opts.add_option(
        'extra_networks_side_panel_auto_hide',
        shared.OptionInfo(
            False,
            'Enable auto-hide side panel',
            gr.Checkbox,
            section=section
        ).info('Automatically hide the side panel to the right edge. Hover over the right edge to reveal it. Only works when the side panel is open.')
    )


script_callbacks.on_ui_settings(on_ui_settings)
